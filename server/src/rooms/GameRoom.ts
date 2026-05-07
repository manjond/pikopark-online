import { Room, Client } from 'colyseus';
import { GameState, ObjectState } from '../state/GameState';
import { PlayerState } from '../state/Player';
import { handlePlayerInput } from '../commands/PlayerCommands';
import { Leaderboard, leaderboardInstance } from '../leaderboard/Leaderboard';
import {
  InputMessage,
  MAX_PLAYERS,
  TICK_RATE,
  GAME_WIDTH,
  GAME_HEIGHT,
  TILE_SIZE,
  GRAVITY,
  JUMP_VELOCITY,
  MOVE_SPEED,
  SPRING_VELOCITY,
  SolidRect,
  LevelData,
  LevelPack,
  ALL_PACKS,
  PACK_SOLO_CADET,
  getRecommendedNextPackId,
} from '@pikopark/shared';

const FLOOR_Y = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // player center when on ground

/** Euclidean distance from point (px,py) to segment (ax,ay)-(bx,by). */
function pointToSegmentDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Number of physics sub-steps per server tick — reduces tunnelling. */
const SUBSTEPS = 3;

/** Cap on spectators per room — they don't count against MAX_PLAYERS. */
const MAX_SPECTATORS = 16;

interface Spectator { id: string; name: string; }

export class GameRoom extends Room<GameState> {
  // Allow up to MAX_PLAYERS active participants + MAX_SPECTATORS observers.
  // We enforce the real split in onAuth/onJoin so the two pools stay separate.
  maxClients = MAX_PLAYERS + MAX_SPECTATORS;

  private solidRects: SolidRect[] = [];
  private currentLevelIndex = 0;
  private levelCompleted = false;
  private hostId = '';
  private prevObjStates = new Map<string, boolean>();
  private prevCrumblePhases = new Map<string, string>();
  private tickCount = 0;
  private trapRestartPending = false;

  // Pack selection — host can change this before game starts
  private selectedPack: LevelPack = PACK_SOLO_CADET;
  private gameStarted = false;
  private mapWidth = GAME_WIDTH; // current level's map width

  // Set after the last level of a pack is completed; clients show the
  // pack-complete overlay and the host picks the next pack (or lobby).
  // While true, regular input/goal logic still runs, but no new level
  // auto-loads until a `continuePack`/`returnToLobby` message arrives.
  private packCompletedPending = false;

  // Spectators live outside state.players — they don't participate in physics,
  // don't count toward minPlayers, can't host, can't press buttons. Keeping
  // them in a separate map ensures no tick-loop iteration accidentally
  // includes them and breaks the game logic.
  private spectators = new Map<string, Spectator>();

  // Level timer — set when a level loads, used by the leaderboard entry.
  private levelStartMs = 0;

  /** Per-client input rate limiting: max messages per 1s window. */
  private readonly MAX_INPUTS_PER_SECOND = 120;
  private inputRates = new Map<string, { count: number; windowStart: number }>();

  private leaderboard: Leaderboard = leaderboardInstance();

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
      // minPlayers counts ACTIVE players only — spectators don't participate.
      const playerCount = this.state.players.size;
      if (playerCount < this.selectedPack.minPlayers) {
        client.send('startError', {
          message: `Need ${this.selectedPack.minPlayers} players — only ${playerCount} connected`,
        });
        return;
      }
      this.gameStarted = true;
      // Timer for leaderboard — starts when the first level actually begins.
      this.levelStartMs = Date.now();
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

    // After a pack finishes, the host picks what to play next. Loads level 0
    // of the chosen pack and broadcasts `levelStart` — clients already handle
    // that via rebuildLevel. Non-host messages are ignored so a spectator can't
    // hijack the choice.
    this.onMessage<{ packId: string }>('continuePack', (client, data) => {
      if (client.sessionId !== this.hostId) return;
      if (!this.packCompletedPending) return;
      const pack = ALL_PACKS.find((p) => p.id === data.packId);
      if (!pack) return;
      const playerCount = this.state.players.size;
      if (playerCount < pack.minPlayers) {
        client.send('startError', {
          message: `Need ${pack.minPlayers} players — only ${playerCount} connected`,
        });
        return;
      }
      this.selectedPack = pack;
      this.packCompletedPending = false;
      this.loadLevel(0, true);
      this.broadcastPackInfo();
      this.levelStartMs = Date.now();
    });

    // Host chooses to exit the pack-complete screen back to the lobby. Resets
    // gameStarted so the room behaves like a fresh lobby, and broadcasts a
    // `returnToLobby` message the clients use to swap scenes.
    this.onMessage('returnToLobby', (client) => {
      if (client.sessionId !== this.hostId) return;
      if (!this.packCompletedPending) return;
      this.gameStarted = false;
      this.packCompletedPending = false;
      this.currentLevelIndex = 0;
      this.loadLevel(0);
      this.broadcast('returnToLobby', {});
      this.broadcastPackInfo();
    });

    this.onMessage<{ text: string }>('chat', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      const spectator = this.spectators.get(client.sessionId);
      const name = player?.name ?? spectator?.name ?? 'Unknown';
      const text = String(data.text ?? '').slice(0, 80).trim();
      if (text) this.broadcast('chat', { name, text, spectator: !!spectator });
    });

    this.setSimulationInterval((dt) => this.tick(dt), 1000 / TICK_RATE);
  }

  onJoin(client: Client, options: Record<string, unknown>): void {
    const wantsSpectator = options['spectator'] === true;
    // Late joiners can now land as active players mid-game instead of being
    // force-converted to spectator. Fallback to spectator only when the
    // active slots are full. A player joining mid-level spawns at the level's
    // spawn point for their slot index and is broadcast to everyone via the
    // next playerList + positions tick.
    const activeFull = this.state.players.size >= MAX_PLAYERS;
    const asSpectator = wantsSpectator || activeFull;

    // Cap enforcement: players cap is MAX_PLAYERS; spectators cap is MAX_SPECTATORS.
    if (asSpectator && this.spectators.size >= MAX_SPECTATORS) {
      client.send('joinError', { message: 'Room full: too many spectators' });
      client.leave();
      return;
    }
    // `activeFull` branch is already redirected to spectator above; the only
    // remaining way to hit this block is a bug, kept as a defensive rail.
    if (!asSpectator && this.state.players.size >= MAX_PLAYERS) {
      client.send('joinError', { message: 'Room full: too many players' });
      client.leave();
      return;
    }

    const defaultName = asSpectator
      ? `Spectator ${this.spectators.size + 1}`
      : `Player ${this.state.players.size + 1}`;
    const name = typeof options['name'] === 'string' ? options['name'] : defaultName;

    client.send('roomCode', { code: this.state.roomCode, spectator: asSpectator });
    client.send('packSelected', {
      packId: this.selectedPack.id,
      name: this.selectedPack.name,
      minPlayers: this.selectedPack.minPlayers,
    });

    const objStates: Array<{ id: string; activated: boolean }> = [];
    this.state.interactiveObjects.forEach((obj) => {
      objStates.push({ id: obj.id, activated: obj.activated });
    });
    if (objStates.length > 0) client.send('objectStates', objStates);

    if (asSpectator) {
      this.spectators.set(client.sessionId, { id: client.sessionId, name });
      this.broadcast('spectatorJoined', { name });

      // Mid-game arrival: send them straight to the current level.
      if (this.gameStarted) {
        const lvl = this.selectedPack.levels[this.currentLevelIndex] ?? this.selectedPack.levels[0]!;
        client.send('gameStart', {
          packId: this.selectedPack.id,
          levelId: lvl.id,
          mapWidth: lvl.mapWidth ?? GAME_WIDTH,
        });
      }

      this.broadcastPlayerList();
      return;
    }

    // ── Active player join ──
    const player = new PlayerState();
    player.id = client.sessionId;
    player.name = name;
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

    // Mid-game arrival: send the new active player straight into GameScene at
    // the current level, same hand-off we use for mid-game spectators. Without
    // this they'd sit on LobbyScene while everyone else is already playing.
    if (this.gameStarted) {
      client.send('gameStart', {
        packId: this.selectedPack.id,
        levelId: levelData.id,
        mapWidth: levelData.mapWidth ?? GAME_WIDTH,
      });
    }

    this.broadcastPlayerList();
  }

  onLeave(client: Client, _consented: boolean): void {
    const spectator = this.spectators.get(client.sessionId);
    if (spectator) {
      this.spectators.delete(client.sessionId);
      this.broadcast('spectatorLeft', { name: spectator.name });
      this.broadcastPlayerList();
      return;
    }
    const player = this.state.players.get(client.sessionId);
    if (player) {
      // Break any carry link this player is part of so neither side is stuck.
      if (player.carrying) {
        const rider = this.state.players.get(player.carrying);
        if (rider) rider.carriedBy = '';
      }
      if (player.carriedBy) {
        const carrier = this.state.players.get(player.carriedBy);
        if (carrier) carrier.carrying = '';
      }
      this.broadcast('playerLeft', { name: player.name });
      this.state.players.delete(client.sessionId);
      this.carryChanged = true;
    }
    if (client.sessionId === this.hostId) {
      this.hostId = '';
      // Host transfer only to another active player — never to a spectator.
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
    this.prevCrumblePhases.clear();
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
      if (def.motion) {
        obj.motionAxis = def.motion.axis;
        obj.motionFrom = def.motion.from;
        obj.motionTo = def.motion.to;
        obj.motionSpeed = def.motion.speed;
        obj.motionPhase = 0;
      }
      if (def.type === 'firebar') {
        obj.segments = def.segments ?? 3;
        obj.angle = ((def.angleDeg ?? 0) * Math.PI) / 180;
      }
      if (def.type === 'crumble') {
        obj.crumblePhase = 'intact';
        obj.crumbleTimer = 0;
        obj.noRespawn = def.noRespawn ?? false;
      }
      if (def.type === 'lavawall') {
        obj.lavaWallSpeed = def.speed ?? 100;
        obj.lavaWallX = def.x;
      }
      if (def.type === 'box') {
        obj.boxVX = 0;
        obj.boxVY = 0;
      }
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
      // Break any stale carry links carried over from the previous level
      player.carriedBy = '';
      player.carrying = '';
      player.prevInteract = false;
      player.atExit = false;
      spawnIndex++;
    });

    // Death-restarts (`restart=true` from trap/firebar hits) keep the timer
    // running so deaths penalise the run instead of granting a fresh clock.
    // Fresh-level entries (initial load, next-level advance, lobby preview)
    // reset to "now". `continuePack` overrides this manually post-call.
    if (!restart) this.levelStartMs = Date.now();

    if (levelIndex > 0 || restart) {
      // `restart` flag tells the client this is a death-respawn, not a fresh
      // level — the HUD timer should keep ticking instead of resetting so
      // the on-screen value matches the server-side leaderboard time.
      this.broadcast('levelStart', { levelId: levelData.id, mapWidth: this.mapWidth, restart });
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

    // ── Advance fire bars (rotation only; collision happens post-integration) ──
    this.state.interactiveObjects.forEach((obj) => {
      if (obj.type !== 'firebar') return;
      obj.angle += obj.power * dt;
    });

    // ── Advance crumble timers; handle state transitions ──────────────────────
    this.state.interactiveObjects.forEach((obj) => {
      if (obj.type !== 'crumble') return;
      if (obj.crumbleTimer > 0) {
        obj.crumbleTimer -= deltaTime;
        if (obj.crumbleTimer <= 0) {
          obj.crumbleTimer = 0;
          if (obj.crumblePhase === 'shaking') {
            obj.crumblePhase = 'falling';
            obj.crumbleTimer = 2000;
          } else if (obj.crumblePhase === 'falling') {
            if (obj.noRespawn) {
              obj.crumblePhase = 'gone';
              obj.crumbleTimer = 0;
            } else {
              obj.crumblePhase = 'respawning';
              obj.crumbleTimer = 800;
            }
          } else if (obj.crumblePhase === 'respawning') {
            obj.crumblePhase = 'intact';
          }
        }
      }
    });

    // ── Process pickup/throw requests (edge-triggered on interact press) ──────
    this.processCarryInputs();

    // ── Pin carried players to their carrier's head before integration ────────
    this.state.players.forEach((player) => {
      if (!player.carriedBy) return;
      const carrier = this.state.players.get(player.carriedBy);
      if (!carrier) { player.carriedBy = ''; return; }
      player.x = carrier.x;
      player.y = carrier.y - TILE_SIZE;
      player.velocityX = 0;
      player.velocityY = 0;
      player.isGrounded = false;
      player.animation = 'carried';
    });

    // ── Physics with sub-steps to prevent tunnelling ───────────────────────────
    const subDt = dt / SUBSTEPS;
    const subDtMs = deltaTime / SUBSTEPS;

    for (let sub = 0; sub < SUBSTEPS; sub++) {
      // Advance moving platforms within the sub-step so riders stay glued —
      // see "Moving platforms" note in CLAUDE.md. Stepping per substep avoids
      // the gravity-lag hover bug where a descending platform out-paces the
      // player and isGrounded flickers off.
      this.state.interactiveObjects.forEach((obj) => {
        if (obj.type === 'platform') obj.tickMotion(subDtMs);
      });

      // Save Y before this sub-step for one-way checks
      const prevY = new Map<string, number>();
      this.state.players.forEach((p, id) => prevY.set(id, p.y));

      // ── Integrate & collide each player ──────────────────────────────────────
      this.state.players.forEach((player, id) => {
        // Carried players were pinned above; skip their integration entirely.
        if (player.carriedBy) return;

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
            player.onIce = rect.tileType === 'ice';
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

        // Crumbling platforms — behave as one-way solids while intact/shaking.
        // Landing on one transitions to 'shaking' (which after 300ms moves to
        // 'falling' and becomes non-solid).
        this.state.interactiveObjects.forEach((crumble) => {
          if (crumble.type !== 'crumble') return;
          if (crumble.crumblePhase !== 'intact' && crumble.crumblePhase !== 'shaking') return;
          const cLft = crumble.x - crumble.width / 2;
          const cRgt = crumble.x + crumble.width / 2;
          const cTop = crumble.y - crumble.height / 2;
          if (!(pRight > cLft && pLeft < cRgt)) return;

          if (
            player.velocityY >= 0 &&
            currBottom >= cTop &&
            prevBottom <= cTop + TILE_SIZE * 0.6
          ) {
            player.y = cTop - TILE_SIZE / 2;
            player.velocityY = 0;
            player.isGrounded = true;
            player.onIce = false;
            if (crumble.crumblePhase === 'intact') {
              crumble.crumblePhase = 'shaking';
              crumble.crumbleTimer = 400;
            }
          }
        });

        // Moving platforms — treat as one-way solids, drag riders along.
        this.state.interactiveObjects.forEach((plat) => {
          if (plat.type !== 'platform') return;
          const pLft = plat.x - plat.width / 2;
          const pRgt = plat.x + plat.width / 2;
          const pTop = plat.y - plat.height / 2;
          if (!(pRight > pLft && pLeft < pRgt)) return;

          if (
            player.velocityY >= 0 &&
            currBottom >= pTop &&
            prevBottom <= pTop + TILE_SIZE * 0.6
          ) {
            // Snap rider to platform top, then drag along with the platform's
            // motion this sub-step. Applies to BOTH up and down — without the
            // downward carry the rider hovers above a descending platform
            // until gravity catches up (~100 ms), and isGrounded flickers
            // false so they can't jump.
            player.y = pTop - TILE_SIZE / 2;
            player.velocityY = 0;
            player.isGrounded = true;
            player.onIce = false;
            player.x += plat.platformVX * subDt;
            player.y += plat.platformVY * subDt;
          }
        });

        // Ground (always resolves)
        if (player.y >= FLOOR_Y) {
          player.y = FLOOR_Y;
          player.velocityY = 0;
          player.isGrounded = true;
          player.onIce = false;
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

      // ── Player vs. player lateral collision ───────────────────────────────────
      // Bodies are solid: walking into another player blocks horizontal motion.
      // We use MTV (minimum-translation-vector) resolution — the stacking case
      // (A standing on B's head) has near-zero vertical overlap and is skipped
      // so this pass never disturbs stacking.
      for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
          this.resolvePlayerPair(players[i][1], players[j][1]);
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

        // Wider tolerance (full TILE_SIZE) and no isGrounded requirement
        // so the button fires even if the player briefly leaves the floor.
        const onButtonLevel = Math.abs(pFeet - btnTop) < TILE_SIZE;
        if (onButtonLevel && pRight > bLeft && pLeft < bRight) {
          count++;
        }
      });

      const needed = obj.requiredPlayers > 0 ? obj.requiredPlayers : 1;
      if (count >= needed) obj.activated = true;
    });

    // ── Propagate button → linked door (AND logic: ALL buttons must activate) ──
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

      // Fire bar — kill on contact with the rotating segment line.
      this.state.interactiveObjects.forEach((obj) => {
        if (obj.type !== 'firebar' || this.trapRestartPending) return;
        const length = obj.segments * TILE_SIZE;
        const tipX = obj.x + Math.cos(obj.angle) * length;
        const tipY = obj.y + Math.sin(obj.angle) * length;
        const HIT_RADIUS = TILE_SIZE * 0.45;
        this.state.players.forEach((player) => {
          if (this.trapRestartPending) return;
          const d = pointToSegmentDist(player.x, player.y, obj.x, obj.y, tipX, tipY);
          if (d < HIT_RADIUS) this.trapRestartPending = true;
        });
      });

      if (this.trapRestartPending) {
        this.broadcast('trapHit', {});
        this.clock.setTimeout(() => { this.loadLevel(this.currentLevelIndex, true); }, 800);
      }
    }

    // ── Fall-death — player falls off the bottom of the map ──────────────────
    if (!this.levelCompleted && !this.trapRestartPending) {
      this.state.players.forEach((player) => {
        if (this.trapRestartPending || player.carriedBy) return;
        if (player.y > GAME_HEIGHT + TILE_SIZE * 3) this.trapRestartPending = true;
      });
      if (this.trapRestartPending) {
        this.broadcast('trapHit', {});
        this.clock.setTimeout(() => { this.loadLevel(this.currentLevelIndex, true); }, 600);
      }
    }

    // ── Lava wall — advance position and kill players on contact ──────────────
    if (!this.levelCompleted && !this.trapRestartPending) {
      this.state.interactiveObjects.forEach((obj) => {
        if (obj.type !== 'lavawall') return;
        obj.lavaWallX += obj.lavaWallSpeed * dt;
        obj.x = obj.lavaWallX;
        const wallRight = obj.lavaWallX + obj.width / 2;
        this.state.players.forEach((player) => {
          if (this.trapRestartPending) return;
          if (player.x - TILE_SIZE / 2 < wallRight) this.trapRestartPending = true;
        });
      });
      if (this.trapRestartPending) {
        this.broadcast('trapHit', {});
        this.clock.setTimeout(() => { this.loadLevel(this.currentLevelIndex, true); }, 500);
      }
    }

    // ── Box physics — gravity, floor/platform collision, player push ──────────
    const BOX_PUSH_SPEED = MOVE_SPEED * 0.55;
    const subDtBox = dt / SUBSTEPS;
    this.state.interactiveObjects.forEach((box) => {
      if (box.type !== 'box') return;
      for (let sub = 0; sub < SUBSTEPS; sub++) {
        box.boxVY += GRAVITY * subDtBox;
        box.x += box.boxVX * subDtBox;
        box.y += box.boxVY * subDtBox;
        box.x = Math.max(box.width / 2, Math.min(this.mapWidth - box.width / 2, box.x));

        const bL = box.x - box.width / 2;
        const bR = box.x + box.width / 2;
        const bB = box.y + box.height / 2;
        let grounded = false;

        for (const rect of this.solidRects) {
          const rL = rect.x;
          const rR = rect.x + rect.width;
          const rT = rect.y;
          if (bR > rL && bL < rR && box.boxVY >= 0 && bB >= rT && bB <= rT + TILE_SIZE * 0.8) {
            box.y = rT - box.height / 2;
            box.boxVY = 0;
            grounded = true;
            break;
          }
        }
        if (grounded) {
          box.boxVX *= 0.75;
          if (Math.abs(box.boxVX) < 4) box.boxVX = 0;
        }

        // Players push box by walking into it
        this.state.players.forEach((player) => {
          if (player.carriedBy) return;
          const pL = player.x - TILE_SIZE / 2;
          const pR = player.x + TILE_SIZE / 2;
          const pT = player.y - TILE_SIZE / 2;
          const pBotBox = box.y + box.height / 2;
          const bTop    = box.y - box.height / 2;
          const vertOk  = pBotBox > pT + 4 && player.y - TILE_SIZE / 2 < pBotBox - 4;
          if (!vertOk) return;
          if (player.velocityX > 0 && pR > bL && pL < bL + 10) {
            box.boxVX = BOX_PUSH_SPEED;
            box.x = player.x + TILE_SIZE / 2 + box.width / 2 + 1;
          } else if (player.velocityX < 0 && pL < bR && pR > bR - 10) {
            box.boxVX = -BOX_PUSH_SPEED;
            box.x = player.x - TILE_SIZE / 2 - box.width / 2 - 1;
          }
        });
      }
    });

    // ── Box-button activation — boxes resting on buttons count as weight ──────
    this.state.interactiveObjects.forEach((btn) => {
      if (btn.type !== 'button' || (btn.latching && btn.activated)) return;
      const bL   = btn.x - btn.width  / 2;
      const bR   = btn.x + btn.width  / 2;
      const bTop = btn.y - btn.height / 2;
      this.state.interactiveObjects.forEach((box) => {
        if (box.type !== 'box') return;
        const boxL = box.x - box.width  / 2;
        const boxR = box.x + box.width  / 2;
        const boxB = box.y + box.height / 2;
        if (boxR > bL && boxL < bR && Math.abs(boxB - bTop) < TILE_SIZE * 0.75 && box.boxVY === 0) {
          btn.activated = true;
        }
      });
    });

    // ── Exit door — interact near goal to enter/exit; all in = level complete ──
    if (!this.levelCompleted) {
      let exitChanged = false;
      this.state.interactiveObjects.forEach((obj) => {
        if (obj.type !== 'goal') return;
        const proximity = TILE_SIZE * 2;
        const gLeft  = obj.x - obj.width  / 2 - proximity;
        const gRight = obj.x + obj.width  / 2 + proximity;
        const gTop   = obj.y - obj.height / 2;
        const gBot   = obj.y + obj.height / 2;
        this.state.players.forEach((player) => {
          const near = player.x > gLeft && player.x < gRight &&
                       player.y + TILE_SIZE / 2 > gTop && player.y - TILE_SIZE / 2 < gBot;
          const interactEdge = player.isInteracting && !player.prevInteract;
          if (near && interactEdge) {
            player.atExit = !player.atExit;
            exitChanged = true;
          } else if (!near && player.atExit) {
            player.atExit = false;
            exitChanged = true;
          }
        });
      });

      if (exitChanged) {
        const exitStates: Array<{ id: string; atExit: boolean }> = [];
        this.state.players.forEach((p) => exitStates.push({ id: p.id, atExit: p.atExit }));
        this.broadcast('exitStates', exitStates);
      }

      // Complete when every active player is waiting at the exit
      let allAtExit = true;
      let anyPlayer = false;
      this.state.players.forEach((p) => { anyPlayer = true; if (!p.atExit) allAtExit = false; });

      if (anyPlayer && allAtExit) {
        this.levelCompleted = true;
        const elapsedMs = Date.now() - this.levelStartMs;
        const levelId = this.state.currentLevel;
        const playerNames: string[] = [];
        this.state.players.forEach((p) => playerNames.push(p.name));
        const rank = this.leaderboard.tryInsert(levelId, {
          timeMs: elapsedMs,
          players: playerNames,
          completedAt: new Date().toISOString(),
        });
        const top = this.leaderboard.getTop(levelId);
        this.broadcast('levelComplete', {
          playerName: playerNames[0] ?? 'Team',
          timeMs: elapsedMs,
          levelId,
          newRecordRank: rank,
          top,
        });
        const nextIndex = this.currentLevelIndex + 1;
        if (nextIndex < this.selectedPack.levels.length) {
          this.clock.setTimeout(() => { this.loadLevel(nextIndex); }, 5000);
        } else {
          this.packCompletedPending = true;
          const activeCount = this.state.players.size;
          const available = ALL_PACKS
            .filter((p) => activeCount >= p.minPlayers)
            .map((p) => ({ id: p.id, name: p.name, minPlayers: p.minPlayers }));
          this.clock.setTimeout(() => {
            this.broadcast('packComplete', {
              completedPackId: this.selectedPack.id,
              completedPackName: this.selectedPack.name,
              recommendedNextId: getRecommendedNextPackId(this.selectedPack.id),
              availablePacks: available,
            });
          }, 4200);
        }
      }
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

    // ── Broadcast moving-platform positions every tick ─────────────────────────
    // The schema doesn't sync x/y for platforms (motion fields are server-only),
    // so clients rely on this message to render their current position.
    const platformPositions: Array<{ id: string; x: number; y: number }> = [];
    this.state.interactiveObjects.forEach((obj) => {
      if (obj.type === 'platform' && obj.motionAxis) {
        platformPositions.push({ id: obj.id, x: obj.x, y: obj.y });
      }
    });
    if (platformPositions.length > 0) this.broadcast('platformPositions', platformPositions);

    // ── Broadcast fire-bar rotations every tick (schema doesn't sync angles) ──
    const firebarAngles: Array<{ id: string; angle: number }> = [];
    this.state.interactiveObjects.forEach((obj) => {
      if (obj.type === 'firebar') firebarAngles.push({ id: obj.id, angle: obj.angle });
    });
    if (firebarAngles.length > 0) this.broadcast('firebarAngles', firebarAngles);

    // ── Broadcast crumble phases (only when changed) ──────────────────────────
    let crumbleChanged = false;
    this.state.interactiveObjects.forEach((obj) => {
      if (obj.type !== 'crumble') return;
      const prev = this.prevCrumblePhases.get(obj.id);
      if (prev !== obj.crumblePhase) {
        crumbleChanged = true;
        this.prevCrumblePhases.set(obj.id, obj.crumblePhase);
      }
    });
    if (crumbleChanged) {
      const crumblePhases: Array<{ id: string; phase: string }> = [];
      this.state.interactiveObjects.forEach((obj) => {
        if (obj.type === 'crumble') crumblePhases.push({ id: obj.id, phase: obj.crumblePhase });
      });
      this.broadcast('crumblePhases', crumblePhases);
    }

    // ── Broadcast carry links (edge-triggered only, to save bandwidth) ─────────
    if (this.carryChanged) {
      const carryList: Array<{ carrierId: string; carriedId: string }> = [];
      this.state.players.forEach((p) => {
        if (p.carrying) carryList.push({ carrierId: p.id, carriedId: p.carrying });
      });
      this.broadcast('carryStates', carryList);
      this.carryChanged = false;
    }

    // ── Broadcast lava wall positions every tick ────────────────────────────────
    const lavaWallPositions: Array<{ id: string; x: number }> = [];
    this.state.interactiveObjects.forEach((obj) => {
      if (obj.type === 'lavawall') lavaWallPositions.push({ id: obj.id, x: obj.lavaWallX });
    });
    if (lavaWallPositions.length > 0) this.broadcast('lavaWallPositions', lavaWallPositions);

    // ── Broadcast box positions every tick ────────────────────────────────────
    const boxPositions: Array<{ id: string; x: number; y: number }> = [];
    this.state.interactiveObjects.forEach((obj) => {
      if (obj.type === 'box') boxPositions.push({ id: obj.id, x: obj.x, y: obj.y });
    });
    if (boxPositions.length > 0) this.broadcast('boxPositions', boxPositions);

    // ── Update prevInteract for all players at end of tick ────────────────────
    this.state.players.forEach((p) => { p.prevInteract = p.isInteracting; });
  }

  // ─── Pickup/throw handling ────────────────────────────────────────────────────

  /** Flag raised by processCarryInputs so we only broadcast on change. */
  private carryChanged = false;

  /**
   * Edge-triggered pickup/throw. On rising edge of Interact:
   *   • If already carrying: throw (apply impulse, clear links).
   *   • Else if grounded and next to a free grounded player: pick them up.
   *
   * Riders themselves cannot press Interact to drop — only the carrier can
   * throw. This keeps the state machine clean and the UX predictable.
   */
  private processCarryInputs(): void {
    const PICKUP_RADIUS = TILE_SIZE * 1.4;
    // Throw velocity — picked so a thrown rider can reach platforms in the
    // [~300, 357) y-band (below STACK3_FEET_PEAK=357). That gives a design
    // window where carry+throw is the only solution, distinct from stacking.
    const THROW_VX = MOVE_SPEED * 1.3;
    const THROW_VY = JUMP_VELOCITY * 1.15;

    this.state.players.forEach((carrier) => {
      const pressEdge = carrier.isInteracting && !carrier.prevInteract;
      if (!pressEdge) return;
      // Being carried → pressing interact has no effect here (only the carrier throws)
      if (carrier.carriedBy) return;

      if (carrier.carrying) {
        // ── Throw ──
        const rider = this.state.players.get(carrier.carrying);
        if (rider) {
          rider.velocityX = carrier.facing * THROW_VX;
          rider.velocityY = THROW_VY;
          rider.carriedBy = '';
          rider.isGrounded = false;
          rider.animation = 'jump';
        }
        carrier.carrying = '';
        this.broadcast('throw', { carrierId: carrier.id });
        this.carryChanged = true;
        return;
      }

      // ── Pickup ── only when grounded; find the closest free grounded neighbour
      if (!carrier.isGrounded) return;
      let best: PlayerState | null = null;
      let bestDist = PICKUP_RADIUS;
      this.state.players.forEach((target) => {
        if (target === carrier) return;
        if (target.carriedBy || target.carrying) return; // already in a carry chain
        if (!target.isGrounded) return;
        const dx = target.x - carrier.x;
        const dy = target.y - carrier.y;
        const d = Math.hypot(dx, dy);
        if (d < bestDist) { best = target; bestDist = d; }
      });
      if (best !== null) {
        const rider: PlayerState = best;
        carrier.carrying = rider.id;
        rider.carriedBy = carrier.id;
        rider.velocityX = 0;
        rider.velocityY = 0;
        rider.animation = 'carried';
        this.broadcast('pickup', { carrierId: carrier.id, carriedId: rider.id });
        this.carryChanged = true;
      }
    });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  /**
   * Resolve a pair of overlapping players along the axis of smallest
   * penetration. Stacking (vertical overlap ~0) is left alone so the
   * dedicated stacking pass owns that interaction; only lateral overlap
   * is pushed apart. Each player absorbs half the correction and any
   * velocity pointing *into* the other player is zeroed.
   */
  private resolvePlayerPair(pA: PlayerState, pB: PlayerState): void {
    const overlapX = TILE_SIZE - Math.abs(pA.x - pB.x);
    if (overlapX <= 0) return;
    const overlapY = TILE_SIZE - Math.abs(pA.y - pB.y);
    if (overlapY <= 0) return;
    // Smaller penetration on Y ⇒ stacking contact, not a side-on hit.
    if (overlapY <= overlapX) return;

    const halfPush = overlapX / 2;
    const aLeftOfB = pA.x < pB.x;
    if (aLeftOfB) {
      pA.x -= halfPush;
      pB.x += halfPush;
      if (pA.velocityX > 0) pA.velocityX = 0;
      if (pB.velocityX < 0) pB.velocityX = 0;
    } else {
      pA.x += halfPush;
      pB.x -= halfPush;
      if (pA.velocityX < 0) pA.velocityX = 0;
      if (pB.velocityX > 0) pB.velocityX = 0;
    }

    const HT = TILE_SIZE / 2;
    pA.x = Math.max(HT, Math.min(this.mapWidth - HT, pA.x));
    pB.x = Math.max(HT, Math.min(this.mapWidth - HT, pB.x));
  }

  private broadcastPlayerList(): void {
    const players: Array<{ id: string; name: string; color: number }> = [];
    this.state.players.forEach((p) => players.push({ id: p.id, name: p.name, color: p.color }));
    const spectators: Array<{ id: string; name: string }> = [];
    this.spectators.forEach((s) => spectators.push({ id: s.id, name: s.name }));
    this.broadcast('playerList', { players, spectators, hostId: this.hostId });
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
