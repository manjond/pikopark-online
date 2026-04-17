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
  SolidRect,
  LevelData,
  LEVEL_1,
  LEVEL_2,
  LEVEL_3,
  LEVEL_4,
  LEVEL_5,
} from '@pikopark/shared';

const FLOOR_Y = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // player center when on ground

/** Number of physics sub-steps per server tick — reduces tunnelling. */
const SUBSTEPS = 3;

const LEVELS: LevelData[] = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5];

export class GameRoom extends Room<GameState> {
  maxClients = MAX_PLAYERS;

  private solidRects: SolidRect[] = [];
  private currentLevelIndex = 0;
  private levelCompleted = false;
  private hostId = '';
  private prevObjStates = new Map<string, boolean>();
  private tickCount = 0;

  onCreate(_options: Record<string, unknown>): void {
    this.setState(new GameState());
    this.state.roomCode = this.generateRoomCode();
    void this.setMetadata({ code: this.state.roomCode });

    this.loadLevel(0);

    this.onMessage<InputMessage>('input', (client, message) => {
      handlePlayerInput(this.state, client, message);
    });

    this.onMessage('ready', (_client) => { /* future: per-player ready gate */ });

    this.onMessage('startGame', (client) => {
      if (client.sessionId === this.hostId) {
        this.broadcast('gameStart', {});
      }
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
    const levelData = LEVELS[this.currentLevelIndex] ?? LEVEL_1;
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
    this.broadcastPlayerList();
  }

  onDispose(): void { /* nothing */ }

  // ─── Level loading ────────────────────────────────────────────────────────────

  private loadLevel(levelIndex: number): void {
    const levelData = LEVELS[levelIndex] ?? LEVEL_1;
    this.currentLevelIndex = levelIndex;
    this.solidRects = levelData.solidRects;
    this.levelCompleted = false;
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

    if (levelIndex > 0) {
      this.broadcast('levelStart', { levelId: levelData.id });
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

        player.x = Math.max(TILE_SIZE / 2, Math.min(GAME_WIDTH - TILE_SIZE / 2, player.x));
        player.isGrounded = false;

        const pLeft   = player.x - TILE_SIZE / 2;
        const pRight  = player.x + TILE_SIZE / 2;
        const prevBottom = py + TILE_SIZE / 2;
        const currBottom = player.y + TILE_SIZE / 2;

        // One-way platform (land from above only)
        for (const rect of this.solidRects) {
          if (rect.tileType === 'ground') continue;
          if (
            player.velocityY >= 0 &&
            pRight > rect.x &&
            pLeft < rect.x + rect.width &&
            currBottom >= rect.y &&
            prevBottom <= rect.y + TILE_SIZE * 0.5   // tolerance: half-tile handles tunnelling
          ) {
            player.y = rect.y - TILE_SIZE / 2;
            player.velocityY = 0;
            player.isGrounded = true;
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
          pA.x = Math.max(TILE_SIZE / 2, Math.min(GAME_WIDTH - TILE_SIZE / 2, pA.x));
          break;
        }
      }
    }

    // ── Block jump if another player is standing on top ────────────────────────
    // (handled in handlePlayerInput — see PlayerCommands.ts)

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

    // ── Propagate button → linked door ─────────────────────────────────────────
    this.state.interactiveObjects.forEach((obj) => {
      if (obj.type !== 'button' || !obj.linkedId) return;
      const door = this.state.interactiveObjects.get(obj.linkedId);
      if (door) door.activated = obj.activated;
    });

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
            if (nextIndex < LEVELS.length) {
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

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }
}
