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

// Player center Y when standing on the ground tile
const FLOOR_Y = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 246

/** Ordered list of all levels — index 0 = first level. */
const LEVELS: LevelData[] = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5];

export class GameRoom extends Room<GameState> {
  maxClients = MAX_PLAYERS;

  /** Solid rectangles for the active level — used for server-side collision. */
  private solidRects: SolidRect[] = [];

  /** 0-based index into LEVELS[]. */
  private currentLevelIndex = 0;

  /** Prevents broadcasting levelComplete more than once per level. */
  private levelCompleted = false;

  onCreate(_options: Record<string, unknown>): void {
    this.setState(new GameState());
    this.state.roomCode = this.generateRoomCode();
    void this.setMetadata({ code: this.state.roomCode });

    this.loadLevel(0);

    this.onMessage<InputMessage>('input', (client, message) => {
      handlePlayerInput(this.state, client, message);
    });

    this.onMessage('ready', (_client) => {
      // TODO: track per-player ready state; start when all are ready
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
  }

  onLeave(client: Client, _consented: boolean): void {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      this.broadcast('playerLeft', { name: player.name });
      this.state.players.delete(client.sessionId);
    }
  }

  onDispose(): void {
    // nothing to clean up
  }

  // ─── Level loading ────────────────────────────────────────────────────────────

  private loadLevel(levelIndex: number): void {
    const levelData = LEVELS[levelIndex] ?? LEVEL_1;
    this.currentLevelIndex = levelIndex;
    this.solidRects = levelData.solidRects;
    this.levelCompleted = false;
    this.state.currentLevel = levelData.id;

    // Clear and repopulate interactive objects
    this.state.interactiveObjects.clear();
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
    }

    // Respawn all existing players at the new level's spawn points
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
      // Notify clients to rebuild their tile geometry for this level
      this.broadcast('levelStart', { levelId: levelData.id });
    }
  }

  // ─── Server-side physics tick ─────────────────────────────────────────────────

  private tick(deltaTime: number): void {
    const dt = deltaTime / 1000;

    // ── 0. Snapshot Y positions before integration (for one-way checks) ────────
    const prevY = new Map<string, number>();
    this.state.players.forEach((p, id) => prevY.set(id, p.y));

    // ── 1. Reset pressure-sensitive buttons; latching buttons keep their state ──
    this.state.interactiveObjects.forEach((obj) => {
      if (obj.type === 'button' && !obj.latching) obj.activated = false;
    });

    // ── 2. Integrate physics + resolve static geometry collisions ──────────────
    this.state.players.forEach((player, id) => {
      const py = prevY.get(id) ?? player.y;

      // Gravity — accumulate while airborne
      if (!player.isGrounded) {
        player.velocityY += GRAVITY * dt;
      }

      // Integrate velocity
      player.x += player.velocityX * dt;
      player.y += player.velocityY * dt;

      // Horizontal world bounds
      player.x = Math.max(TILE_SIZE / 2, Math.min(GAME_WIDTH - TILE_SIZE / 2, player.x));

      player.isGrounded = false;

      const pLeft = player.x - TILE_SIZE / 2;
      const pRight = player.x + TILE_SIZE / 2;
      const prevBottom = py + TILE_SIZE / 2;
      const currBottom = player.y + TILE_SIZE / 2;

      // ── One-way platform collision (land from above only) ───────────────────
      for (const rect of this.solidRects) {
        if (rect.tileType === 'ground') continue;

        if (
          player.velocityY >= 0 &&
          pRight > rect.x &&
          pLeft < rect.x + rect.width &&
          currBottom >= rect.y &&
          prevBottom <= rect.y
        ) {
          player.y = rect.y - TILE_SIZE / 2;
          player.velocityY = 0;
          player.isGrounded = true;
          break;
        }
      }

      // ── Ground collision (always resolves against the bottom ground tile) ────
      if (player.y >= FLOOR_Y) {
        player.y = FLOOR_Y;
        player.velocityY = 0;
        player.isGrounded = true;
      }

      // ── Door collision (solid AABB when door is closed) ─────────────────────
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
          const overlapLeft = pR - dL;
          const overlapRight = dR - pL;
          if (overlapLeft <= overlapRight) {
            player.x = dL - TILE_SIZE / 2;
          } else {
            player.x = dR + TILE_SIZE / 2;
          }
          player.velocityX = 0;
        }
      });
    });

    // ── 3. Player stacking — one player can land on another's head ─────────────
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

        const bTop = pB.y - TILE_SIZE / 2;
        const aLeft = pA.x - TILE_SIZE / 2;
        const aRight = pA.x + TILE_SIZE / 2;
        const bLeft = pB.x - TILE_SIZE / 2;
        const bRight = pB.x + TILE_SIZE / 2;

        const horizOverlap = aRight > bLeft && aLeft < bRight;

        if (
          pA.velocityY >= 0 &&   // A falling downward
          horizOverlap &&
          currABottom >= bTop && // A's feet now at or below B's head
          prevABottom <= bTop    // A's feet were above B's head last tick
        ) {
          pA.y = bTop - TILE_SIZE / 2;  // snap A on top of B
          pA.velocityY = 0;
          pA.isGrounded = true;
          break;
        }
      }
    }

    // ── 4. Button trigger — count players on each button, compare requiredPlayers
    this.state.interactiveObjects.forEach((obj) => {
      if (obj.type !== 'button') return;
      if (obj.latching && obj.activated) return; // already latched, skip

      const bLeft = obj.x - obj.width / 2;
      const bRight = obj.x + obj.width / 2;
      let count = 0;
      this.state.players.forEach((player) => {
        const pLeft = player.x - TILE_SIZE / 2;
        const pRight = player.x + TILE_SIZE / 2;
        if (player.isGrounded && pRight > bLeft && pLeft < bRight) count++;
      });

      const needed = obj.requiredPlayers > 0 ? obj.requiredPlayers : 1;
      if (count >= needed) obj.activated = true;
    });

    // ── 5. Propagate button → linked door ─────────────────────────────────────
    this.state.interactiveObjects.forEach((obj) => {
      if (obj.type !== 'button' || !obj.linkedId) return;
      const door = this.state.interactiveObjects.get(obj.linkedId);
      if (door) door.activated = obj.activated;
    });

    // ── 6. Goal detection — broadcast once when any player touches the goal ────
    if (!this.levelCompleted) {
      this.state.players.forEach((player) => {
        if (this.levelCompleted) return;

        const pLeft  = player.x - TILE_SIZE / 2;
        const pRight = player.x + TILE_SIZE / 2;
        const pTop   = player.y - TILE_SIZE / 2;
        const pBottom = player.y + TILE_SIZE / 2;

        this.state.interactiveObjects.forEach((obj) => {
          if (obj.type !== 'goal' || this.levelCompleted) return;

          const gLeft   = obj.x - obj.width / 2;
          const gRight  = obj.x + obj.width / 2;
          const gTop    = obj.y - obj.height / 2;
          const gBottom = obj.y + obj.height / 2;

          if (pRight > gLeft && pLeft < gRight && pBottom > gTop && pTop < gBottom) {
            this.levelCompleted = true;
            this.broadcast('levelComplete', { playerName: player.name });

            // Transition to the next level after 5 seconds (if one exists)
            const nextIndex = this.currentLevelIndex + 1;
            if (nextIndex < LEVELS.length) {
              this.clock.setTimeout(() => {
                this.loadLevel(nextIndex);
              }, 5000);
            }
          }
        });
      });
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from(
      { length: 4 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
  }
}
