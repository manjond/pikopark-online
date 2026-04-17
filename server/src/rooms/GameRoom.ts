import { Room, Client } from 'colyseus';
import { GameState, ObjectState } from '../state/GameState';
import { PlayerState } from '../state/Player';
import { handlePlayerInput } from '../commands/PlayerCommands';
import {
  InputMessage,
  MAX_PLAYERS,
  TICK_RATE,
  GAME_WIDTH,
  GAME_HEIGHT,
  TILE_SIZE,
  GRAVITY,
  SPRING_VELOCITY,
  SolidRect,
  LevelData,
  LevelPack,
  ALL_PACKS,
  PACK_BASICS,
} from '@pikopark/shared';

const FLOOR_Y = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // player center when on ground

/** Number of physics sub-steps per server tick — reduces tunnelling. */
const SUBSTEPS = 3;

export class GameRoom extends Room<GameState> {
  maxClients = MAX_PLAYERS;

  private solidRects: SolidRect[] = [];
  private currentLevelIndex = 0;
  private levelCompleted = false;
  private hostId = '';
  private prevObjStates = new Map<string, boolean>();
  private tickCount = 0;
  private trapRestartPending = false;

  // Pack selection — host can change this before game starts
  private selectedPack: LevelPack = PACK_BASICS;
  private gameStarted = false;
  private mapWidth = GAME_WIDTH; // current level's map width

  /** Per-client input rate limiting: max messages per 1s window. */
  private readonly MAX_INPUTS_PER_SECOND = 120;
  private inputRates = new Map<string, { count: number; windowStart: number }>();

  onCreate(_options: Record<string, unknown>): void {
    this.setState(new GameState());
    this.state.roomCode = this.generateRoomCode();
    void this.setMetadata({ code: this.state.roomCode });

    this.loadLevel(0);

    this.onMessage<InputMessage>('input', (client, message) => {
      // Drop silently if this client exceeds its budget for the current 1 s
      // window. 120 msg/s is roughly 2× the max expected frame rate and gives
      // plenty of headroom for legitimate clients.
      const now = Date.now();
      const rec = this.inputRates.get(client.sessionId);
      if (!rec || now - rec.windowStart >= 1000) {
        this.inputRates.set(client.sessionId, { count: 1, windowStart: now });
      } else {
        rec.count++;
        if (rec.count > this.MAX_INPUTS_PER_SECOND) return;
      }
      handlePlayerInput(this.state, client, message);
    });

    this.onMessage<{ packId: string }>('selectPack', (client, data) => {
      if (client.sessionId !== this.hostId || this.gameStarted) return;
      const pack = ALL_PACKS.find((p) => p.id === data.packId);
      if (!pack) return;
      this.selectedPack = pack;
      this.loadLevel(0); // reset to first level of new pack in lobby preview
      this.broadcastPackInfo();
    });

    this.onMessage('startGame', (client) => {
      if (client.sessionId !== this.hostId) return;
      const playerCount = this.state.players.size;
      if (playerCount < this.selectedPack.minPlayers) {
        client.send('startError', {
          message: `Need ${this.selectedPack.minPlayers} players — only ${playerCount} connected`,
        });
        return;
      }
      this.gameStarted = true;
      // Send the current level info so clients can render the correct first
      // level (not assume Basics L1). Prevents visual/physics desync when
      // the host selected Duo/Hazards/Squad/Extreme.
      const firstLevel = this.selectedPack.levels[this.currentLevelIndex] ?? this.selectedPack.levels[0]!;
      this.broadcast('gameStart', {
        packId: this.selectedPack.id,
        levelId: firstLevel.id,
        mapWidth: firstLevel.mapWidth ?? GAME_WIDTH,
      });
    });

    this.onMessage<{ text: string }>('chat', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      const name = player?.name ?? 'Unknown';
      const text = String(data.text ?? '').slice(0, 80).trim();
      if (text) this.broadcast('chat', { name, text });
    });

    this.setSimulationInterval((dt) => this.tick(dt), 1000 / TICK_RATE);
  }

  onJoin(client: Client, options: Record<string, unknown>): void {
    const player = new PlayerState();
    player.id = client.sessionId;
    player.name =
      typeof options['name'] === 'string'
        ? options['name']
        : `Player ${this.state.players.size + 1}`;
    player.color = this.state.players.size % MAX_PLAYERS;

    const spawnIndex = this.state.players.size;
    const levelData = this.selectedPack.levels[this.currentLevelIndex] ?? this.selectedPack.levels[0]!;
    const spawn = levelData.spawnPoints[spawnIndex] ?? {
      x: TILE_SIZE / 2 + spawnIndex * (TILE_SIZE + 8),
      y: FLOOR_Y,
    };
    player.x = spawn.x;
    player.y = spawn.y;
    player.isGrounded = true;

    this.state.players.set(client.sessionId, player);
    this.broadcast('playerJoined', { name: player.name, color: player.color });

    if (this.hostId === '') this.hostId = client.sessionId;

    client.send('roomCode', { code: this.state.roomCode });
    client.send('packSelected', {
      packId: this.selectedPack.id,
      name: this.selectedPack.name,
      minPlayers: this.selectedPack.minPlayers,
    });

    // Send current object states to the new joiner immediately
    const objStates: Array<{ id: string; activated: boolean }> = [];
    this.state.interactiveObjects.forEach((obj) => {
      objStates.push({ id: obj.id, activated: obj.activated });
    });
    if (objStates.length > 0) client.send('objectStates', objStates);

    this.broadcastPlayerList();
  }

  onLeave(client: Client, _consented: boolean): void {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      this.broadcast('playerLeft', { name: player.name });
      this.state.players.delete(client.sessionId);
    }
    if (client.sessionId === this.hostId) {
      this.hostId = '';
      this.state.players.forEach((p) => { if (!this.hostId) this.hostId = p.id; });
    }
    this.inputRates.delete(client.sessionId);
    this.broadcastPlayerList();
  }

  onDispose(): void { /* nothing */ }

  // ─── Level loading ────────────────────────────────────────────────────────────

  private loadLevel(levelIndex: number, restart = false): void {
    const levels = this.selectedPack.levels;
    const levelData: LevelData = levels[levelIndex] ?? levels[0] ?? this.selectedPack.levels[0];
    this.currentLevelIndex = levelIndex;
    this.mapWidth = levelData.mapWidth ?? GAME_WIDTH;
    this.solidRects = levelData.solidRects;
    this.levelCompleted = false;
    this.trapRestartPending = false;
    this.state.currentLevel = levelData.id;

    this.state.interactiveObjects.clear();
    this.prevObjStates.clear();
    for (const def of levelData.objects) {
      const obj = new ObjectState();
      obj.id = def.id;
      obj.type = def.type;
      obj.x = def.x;
      obj.y = def.y;
      obj.width = def.width;
      obj.height = def.height;
      obj.requiredPlayers = def.requiredPlayers;
      obj.linkedId = def.linkedId;
      obj.latching = def.latching ?? false;
      obj.activated = false;
      obj.power = def.power ?? (def.type === 'spring' ? SPRING_VELOCITY : 0);
      this.state.interactiveObjects.set(def.id, obj);
      this.prevObjStates.set(def.id, false);
    }

    let spawnIndex = 0;
    this.state.players.forEach((player) => {
      const spawn = levelData.spawnPoints[spawnIndex] ?? {
        x: TILE_SIZE / 2 + spawnIndex * (TILE_SIZE + 8),
        y: FLOOR_Y,
      };
      player.x = spawn.x;
      player.y = spawn.y;
      player.velocityX = 0;
      player.velocityY = 0;
      player.isGrounded = true;
      spawnIndex++;
    });

    if (levelIndex > 0 || restart) {
      this.broadcast('levelStart', { levelId: levelData.id, mapWidth: this.mapWidth });
      const objStates: Array<{ id: string; activated: boolean }> = [];
      this.state.interactiveObjects.forEach((obj) => {
        objStates.push({ id: obj.id, activated: obj.activated });
      });
      this.broadcast('objectStates', objStates);
    }
  }

  // ─── Physics tick ─────────────────────────────────────────────────────────────

  private tick(deltaTime: number): void {
    const dt = deltaTime / 1000;
    this.tickCount++;

    // Broadcast player list at 5 Hz — catches late-subscribing lobby clients
    if (this.tickCount % 4 === 0) this.broadcastPlayerList();

    // ── Reset pressure-sensitive buttons each tick ─────────────────────────────
    this.state.interactiveObjects.forEach((obj) => {
      if (obj.type === 'button' && !obj.latching) obj.activated = false;
    });

    // ── Physics with sub-steps to prevent tunnelling ───────────────────────────
    const subDt = dt / SUBSTEPS;

    for (let sub = 0; sub < SUBSTEPS; sub++) {
      // Save Y before this sub-step for one-way checks
      const prevY = new Map<string, number>();
      this.state.players.forEach((p, id) => prevY.set(id, p.y));

      // ── Integrate & collide each player ──────────────────────────────────────
      this.state.players.forEach((player, id) => {
        const py = prevY.get(id) ?? player.y;

        if (!player.isGrounded) {
          player.velocityY += GRAVITY * subDt;
        }

        player.x += player.velocityX * subDt;
        player.y += player.velocityY * subDt;

        player.x = Math.max(TILE_SIZE / 2, Math.min(this.mapWidth - TILE_SIZE / 2, player.x));
        player.isGrounded = false;

        const pLeft   = player.x - TILE_SIZE / 2;
        const pRight  = player.x + TILE_SIZE / 2;
        const prevBottom = py + TILE_SIZE / 2;
        const currBottom = player.y + TILE_SIZE / 2;

        const currHead = player.y - TILE_SIZE / 2;
        const prevHead = py  - TILE_SIZE / 2;

        for (const rect of this.solidRects) {
          if (rect.tileType === 'ground') continue;
          const horizOverlap = pRight > rect.x && pLeft < rect.x + rect.width;
          if (!horizOverlap) continue;

          // Land from above
          if (
            player.velocityY >= 0 &&
            currBottom >= rect.y &&
            prevBottom <= rect.y + TILE_SIZE * 0.5
          ) {
            player.y = rect.y - TILE_SIZE / 2;
            player.velocityY = 0;
            player.isGrounded = true;
            break;
          }

          // Ceiling bump — jumping into underside of platform
          const ceilFace = rect.y + rect.height;
          if (
            player.velocityY < 0 &&
            currHead <= ceilFace &&
            prevHead >= ceilFace - TILE_SIZE * 0.5
          ) {
            player.y = ceilFace + TILE_SIZE / 2;
            player.velocityY = 0;
            break;
          }
        }

        // Ground (always resolves)
        if (player.y >= FLOOR_Y) {
          player.y = FLOOR_Y;
          player.velocityY = 0;
          player.isGrounded = true;
        }

        // Door collision (solid AABB when closed)
        this.state.interactiveObjects.forEach((obj) => {
          if (obj.type !== 'door' || obj.activated) return;
          const pL = player.x - TILE_SIZE / 2;
          const pR = player.x + TILE_SIZE / 2;
          const pT = player.y - TILE_SIZE / 2;
          const pB = player.y + TILE_SIZE / 2;
          const dL = obj.x - obj.width / 2;
          const dR = obj.x + obj.width / 2;
          const dT = obj.y - obj.height / 2;
          const dB = obj.y + obj.height / 2;
          if (pR > dL && pL < dR && pB > dT && pT < dB) {
            if (pR - dL <= dR - pL) { player.x = dL - TILE_SIZE / 2; }
            else                    { player.x = dR + TILE_SIZE / 2; }
            player.velocityX = 0;
          }
        });
      });

      // ── Player stacking — land on another player's head ───────────────────────
      const players: Array<[string, PlayerState]> = [];
      this.state.players.forEach((p, id) => players.push([id, p]));

      for (let i = 0; i < players.length; i++) {
        const [idA, pA] = players[i];
        const pyA = prevY.get(idA) ?? pA.y;
        const prevABottom = pyA + TILE_SIZE / 2;
        const currABottom = pA.y + TILE_SIZE / 2;

        for (let j = 0; j < players.length; j++) {
          if (i === j) continue;
          const [, pB] = players[j];
          const bTop   = pB.y - TILE_SIZE / 2;
          const aLeft  = pA.x - TILE_SIZE / 2;
          const aRight = pA.x + TILE_SIZE / 2;
          const bLeft  = pB.x - TILE_SIZE / 2;
          const bRight = pB.x + TILE_SIZE / 2;
          const horizOverlap = aRight > bLeft && aLeft < bRight;
          if (
            pA.velocityY >= 0 &&
            horizOverlap &&
            currABottom >= bTop &&
            prevABottom <= bTop + TILE_SIZE * 0.5   // tolerance matches one-way
          ) {
            pA.y = bTop - TILE_SIZE / 2;
            pA.velocityY = 0;
            pA.isGrounded = true;
            break;
          }
        }
      }
    }

    // ── Carry: if A is standing on B, propagate B's horizontal movement ────────
    const allPlayers: Array<PlayerState> = [];
    this.state.players.forEach((p) => allPlayers.push(p));

    for (const pA of allPlayers) {
      const aFeet = pA.y + TILE_SIZE / 2;
      for (const pB of allPlayers) {
        if (pA === pB) continue;
        const bHead = pB.y - TILE_SIZE / 2;
        const horizOverlap = Math.abs(pA.x - pB.x) < TILE_SIZE * 0.9;
        if (horizOverlap && Math.abs(aFeet - bHead) < TILE_SIZE * 0.25) {
          // A is standing on B — carry with B's velocity
          pA.x += pB.velocityX * (dt / 1); // use full dt (carry runs once, not per substep)
          pA.x = Math.max(TILE_SIZE / 2, Math.min(this.mapWidth - TILE_SIZE / 2, pA.x));
          break;
        }
      }
    }

    // ── Block jump if another player is standing on top ────────────────────────
    // (handled in handlePlayerInput — see PlayerCommands.ts)

    // ── Spring launch ─────────────────────────────────────────────────────────
    // When a player lands on the top surface of a spring, snap to the top
    // and apply an upward impulse. One broadcast per bounce lets clients
    // play a sound and animate the spring.
    this.state.interactiveObjects.forEach((spring) => {
      if (spring.type !== 'spring') return;
      const sLeft = spring.x - spring.width / 2;
      const sRight = spring.x + spring.width / 2;
      const sTop  = spring.y - spring.height / 2;

      this.state.players.forEach((player) => {
        const pLeft   = player.x - TILE_SIZE / 2;
        const pRight  = player.x + TILE_SIZE / 2;
        const pBottom = player.y + TILE_SIZE / 2;

        const horizOverlap = pRight > sLeft && pLeft < sRight;
        const onTop =
          pBottom >= sTop &&
          pBottom <= sTop + TILE_SIZE * 0.6 &&
          player.velocityY >= 0;

        if (horizOverlap && onTop) {
          player.y = sTop - TILE_SIZE / 2;
          player.velocityY = spring.power !== 0 ? spring.power : SPRING_VELOCITY;
          player.isGrounded = false;
          this.broadcast('springBounce', { id: spring.id, playerId: player.id });
        }
      });
    });

    // ── Button trigger ────────────────────────────────────────────────────────
    this.state.interactiveObjects.forEach((obj) => {
      if (obj.type !== 'button') return;
      if (obj.latching && obj.activated) return;

      const bLeft   = obj.x - obj.width / 2;
      const bRight  = obj.x + obj.width / 2;
      const btnTop  = obj.y - obj.height / 2;   // top surface of the button

      let count = 0;
      this.state.players.forEach((player) => {
        const pLeft  = player.x - TILE_SIZE / 2;
        const pRight = player.x + TILE_SIZE / 2;
        const pFeet  = player.y + TILE_SIZE / 2; // bottom of player

        // Must be grounded, horizontally overlapping, AND standing at the button's level
        const onButtonLevel = Math.abs(pFeet - btnTop) < TILE_SIZE * 0.75;
        if (player.isGrounded && onButtonLevel && pRight > bLeft && pLeft < bRight) {
          count++;
        }
      });

      const needed = obj.requiredPlayers > 0 ? obj.requiredPlayers : 1;
      if (count >= needed) obj.activated = true;
    });

    // ── Propagate button → linked door (AND logic: ALL buttons must activate) ──
    // Multiple buttons can share one door — all must be active to open it.
    const doorVotes = new Map<string, { total: number; active: number }>();
    this.state.interactiveObjects.forEach((obj) => {
      if (obj.type !== 'button' || !obj.linkedId) return;
      const v = doorVotes.get(obj.linkedId) ?? { total: 0, active: 0 };
      v.total++;
      if (obj.activated) v.active++;
      doorVotes.set(obj.linkedId, v);
    });
    doorVotes.forEach((v, doorId) => {
      const door = this.state.interactiveObjects.get(doorId);
      if (door) door.activated = v.active >= v.total;
    });

    // ── Trap detection — touching a trap restarts the level ────────────────────
    if (!this.levelCompleted && !this.trapRestartPending) {
      this.state.interactiveObjects.forEach((obj) => {
        if (obj.type !== 'trap' || this.trapRestartPending) return;
        if (obj.activated) return; // linked button is held — trap is deactivated
        const tL = obj.x - obj.width  / 2;
        const tR = obj.x + obj.width  / 2;
        const tT = obj.y - obj.height / 2;
        const tB = obj.y + obj.height / 2;
        this.state.players.forEach((player) => {
          if (this.trapRestartPending) return;
          const pL = player.x - TILE_SIZE / 2;
          const pR = player.x + TILE_SIZE / 2;
          const pT = player.y - TILE_SIZE / 2;
          const pB = player.y + TILE_SIZE / 2;
          if (pR > tL && pL < tR && pB > tT && pT < tB) {
            this.trapRestartPending = true;
          }
        });
      });
      if (this.trapRestartPending) {
        this.broadcast('trapHit', {});
        this.clock.setTimeout(() => { this.loadLevel(this.currentLevelIndex, true); }, 800);
      }
    }

    // ── Goal detection ─────────────────────────────────────────────────────────
    if (!this.levelCompleted) {
      this.state.players.forEach((player) => {
        if (this.levelCompleted) return;
        const pLeft   = player.x - TILE_SIZE / 2;
        const pRight  = player.x + TILE_SIZE / 2;
        const pTop    = player.y - TILE_SIZE / 2;
        const pBottom = player.y + TILE_SIZE / 2;
        this.state.interactiveObjects.forEach((obj) => {
          if (obj.type !== 'goal' || this.levelCompleted) return;
          const gLeft  = obj.x - obj.width  / 2;
          const gRight = obj.x + obj.width  / 2;
          const gTop   = obj.y - obj.height / 2;
          const gBot   = obj.y + obj.height / 2;
          if (pRight > gLeft && pLeft < gRight && pBottom > gTop && pTop < gBot) {
            this.levelCompleted = true;
            this.broadcast('levelComplete', { playerName: player.name });
            const nextIndex = this.currentLevelIndex + 1;
            if (nextIndex < this.selectedPack.levels.length) {
              this.clock.setTimeout(() => { this.loadLevel(nextIndex); }, 5000);
            }
          }
        });
      });
    }

    // ── Broadcast positions every tick ─────────────────────────────────────────
    const positions: Array<{ id: string; x: number; y: number; vx: number; grounded: boolean; anim: string }> = [];
    this.state.players.forEach((p) => {
      positions.push({ id: p.id, x: p.x, y: p.y, vx: p.velocityX, grounded: p.isGrounded, anim: p.animation });
    });
    if (positions.length > 0) this.broadcast('positions', positions);

    // ── Broadcast object states only when changed ───────────────────────────────
    let objChanged = false;
    this.state.interactiveObjects.forEach((obj) => {
      if (this.prevObjStates.get(obj.id) !== obj.activated) {
        objChanged = true;
        this.prevObjStates.set(obj.id, obj.activated);
      }
    });
    if (objChanged) {
      const objStates: Array<{ id: string; activated: boolean }> = [];
      this.state.interactiveObjects.forEach((obj) => objStates.push({ id: obj.id, activated: obj.activated }));
      this.broadcast('objectStates', objStates);
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private broadcastPlayerList(): void {
    const players: Array<{ id: string; name: string; color: number }> = [];
    this.state.players.forEach((p) => players.push({ id: p.id, name: p.name, color: p.color }));
    this.broadcast('playerList', { players, hostId: this.hostId });
  }

  private broadcastPackInfo(): void {
    this.broadcast('packSelected', {
      packId: this.selectedPack.id,
      name: this.selectedPack.name,
      minPlayers: this.selectedPack.minPlayers,
    });
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
}
