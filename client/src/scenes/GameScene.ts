import Phaser from 'phaser';
import { Room } from 'colyseus.js';
import { Player } from '../entities/Player';
import { InteractiveObject } from '../entities/InteractiveObject';
import {
  ColyseusClient,
  NetworkGameState,
} from '../network/ColyseusClient';
import type { UIScene } from './UIScene';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  TILE_SIZE,
  InputMessage,
  ALL_PACKS,
  SolidRect,
  LevelObjectDef,
  LevelData,
} from '@pikopark/shared';
import {
  generatePlayerSpritesheet,
  registerPlayerAnims,
} from '../utils/PlayerTextures';
import { playJump, playLevelComplete, playSpring, startBgMusic, stopBgMusic } from '../utils/SoundSystem';
import { FONT } from '../ui/theme';

interface GameSceneData {
  room?: Room;
  network?: ColyseusClient;
  packId?: string;
  levelId?: number;
  mapWidth?: number;
  isSpectator?: boolean;
  /** Pre-resolved room code from LobbyScene — used for the HUD */
  roomCode?: string;
}

interface PositionMsg {
  id: string;
  x: number;
  y: number;
  vx: number;
  grounded: boolean;
  anim: string;
}

interface PlayerListMsg {
  players: Array<{ id: string; name: string; color: number }>;
  hostId: string;
}

export class GameScene extends Phaser.Scene {
  // ── Terrain ────────────────────────────────────────────────────────────────
  private tiles!: Phaser.Physics.Arcade.StaticGroup;
  private doorGroup!: Phaser.Physics.Arcade.StaticGroup;

  // ── All players — both local and remote, all driven by server positions ────
  // Using one map for everything eliminates the dual-simulation desync.
  private players = new Map<string, Player>();

  // ── Interactive objects ────────────────────────────────────────────────────
  private interactiveObjects = new Map<string, InteractiveObject>();
  /** Tracks last-known activated state per door — used to detect open transitions. */
  private doorPrevActivated = new Map<string, boolean>();
  /** Position of the current level's goal (used for the level-complete burst). */
  private goalPosition: { x: number; y: number } | null = null;

  // ── Background (parallax) ──────────────────────────────────────────────────
  private parallaxFar!: Phaser.GameObjects.TileSprite;
  private parallaxNear!: Phaser.GameObjects.TileSprite;

  // ── Input ──────────────────────────────────────────────────────────────────
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  /** Interact key (E) — pickup/throw another player. */
  private interactKey!: Phaser.Input.Keyboard.Key;
  private touchInteractPending = false;

  // ── Network ────────────────────────────────────────────────────────────────
  private network!: ColyseusClient;
  private room: Room | null = null;
  private localSessionId = '';
  private inputSequence = 0;

  // ── Level-complete overlay ─────────────────────────────────────────────────
  private levelCompleteOverlay: Phaser.GameObjects.GameObject[] = [];
  /**
   * Timer that fades the camera to black 4.4s after levelComplete. We keep
   * the handle so we can cancel it if (a) the next `levelStart` arrives
   * before the fade fires, or (b) the pack ended and we want to show the
   * pack-complete overlay instead of a permanent black screen.
   */
  private levelCompleteFadeTimer: Phaser.Time.TimerEvent | null = null;

  // ── Pack-complete overlay ─────────────────────────────────────────────────
  private packCompleteOverlay: Phaser.GameObjects.GameObject[] = [];
  private isHost = false;

  // ── Touch controls ─────────────────────────────────────────────────────────
  private touchLeft = false;
  private touchRight = false;
  private touchJumpPending = false;

  // ── Timing ────────────────────────────────────────────────────────────────
  private levelStartTime = 0;

  // ── Pre-connected room from LobbyScene ────────────────────────────────────
  private preConnectedRoom: Room | null = null;
  private preConnectedNetwork: ColyseusClient | null = null;

  // ── Initial level info passed from LobbyScene ─────────────────────────────
  private initialPackId: string | null = null;
  private initialLevelId: number | null = null;
  private initialMapWidth: number | null = null;

  // ── Spectator mode ─────────────────────────────────────────────────────────
  private isSpectator = false;
  private spectatorCameraX = 0;

  // ── Room code passed from LobbyScene for immediate HUD display ────────────
  private initialRoomCode: string | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameSceneData): void {
    this.preConnectedRoom = data.room ?? null;
    this.preConnectedNetwork = data.network ?? null;
    this.initialPackId = data.packId ?? null;
    this.initialLevelId = data.levelId ?? null;
    this.initialMapWidth = data.mapWidth ?? null;
    this.isSpectator = data.isSpectator === true;
    this.initialRoomCode = data.roomCode ?? null;
  }

  create(): void {
    // Resolve the initial level from scene data (sent by the server in
    // gameStart). Falls back to the selected pack's first level, then to
    // Basics L1. This prevents the client from rendering the wrong level
    // when the host selected Duo/Hazards/Squad/Extreme.
    const allLevels: LevelData[] = ALL_PACKS.flatMap((p) => p.levels);
    const byId = this.initialLevelId !== null
      ? allLevels.find((l) => l.id === this.initialLevelId)
      : undefined;
    const byPack = this.initialPackId
      ? ALL_PACKS.find((p) => p.id === this.initialPackId)?.levels[0]
      : undefined;
    const startLevel = byId ?? byPack ?? ALL_PACKS[0]?.levels[0];
    const startMapWidth = this.initialMapWidth ?? startLevel?.mapWidth ?? GAME_WIDTH;

    this.physics.world.setBounds(0, 0, startMapWidth, GAME_HEIGHT);
    this.cameras.main.setBounds(0, 0, startMapWidth, GAME_HEIGHT);

    // ── Textures + parallax background (must exist before anything else) ──
    this.generateTileTextures();
    this.createParallaxBackground();

    // ── Level geometry ─────────────────────────────────────────────────────
    this.tiles = this.physics.add.staticGroup();
    if (startLevel) this.buildSolidRects(startLevel.solidRects);
    this.tiles.refresh();

    // doorGroup holds door physics bodies for visual reference;
    // collision is server-authoritative so client-side bodies are cosmetic.
    this.doorGroup = this.physics.add.staticGroup();

    // ── Load starting level interactive objects ────────────────────────────
    if (startLevel) this.loadLevelObjects(startLevel.objects);

    // ── Input ──────────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.scene.launch('UIScene');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);

    // UIScene.create() runs on the next frame, so defer the HUD update by a
    // tick so the target text field exists.
    if (this.initialRoomCode) {
      const code = this.initialRoomCode;
      this.time.delayedCall(50, () => this.ui()?.setConnected(code));
    }

    startBgMusic();
    this.levelStartTime = Date.now();

    if (this.isSpectator) {
      // Start camera at the map centre; will auto-follow once positions arrive.
      this.spectatorCameraX = Math.min(GAME_WIDTH / 2, startMapWidth / 2);
      this.add.text(GAME_WIDTH - 8, 8, 'SPECTATING', {
        fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#ff99ee',
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(40);
    } else {
      this.createTouchControls();
    }

    // ── Connect ────────────────────────────────────────────────────────────
    if (this.preConnectedRoom !== null) {
      this.network = this.preConnectedNetwork ?? new ColyseusClient();
      this.room = this.preConnectedRoom;
      this.localSessionId = this.room.sessionId;
      this.subscribeToRoom();
    } else {
      this.network = new ColyseusClient();
      this.connect().catch((err: unknown) => {
        console.warn('[GameScene] No server — running offline:', err);
        this.time.delayedCall(50, () => this.ui()?.setOffline());
      });
    }
  }

  update(_time: number, delta: number): void {
    // ── Advance all player sprites (lerp toward server target) ────────────
    this.players.forEach((p) => p.tick(delta));

    // ── Parallax — drift cloud layers relative to camera scroll ────────────
    const sx = this.cameras.main.scrollX;
    if (this.parallaxFar)  this.parallaxFar.tilePositionX  = sx * 0.2;
    if (this.parallaxNear) this.parallaxNear.tilePositionX = sx * 0.5;

    if (this.isSpectator) {
      this.updateSpectatorCamera(delta);
      return;
    }

    // ── Read inputs (active players only) ──────────────────────────────────
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.up) ||
      this.touchJumpPending;
    this.touchJumpPending = false;

    const movingLeft  = this.cursors.left.isDown  || this.wasd.left.isDown  || this.touchLeft;
    const movingRight = this.cursors.right.isDown || this.wasd.right.isDown || this.touchRight;

    const interactPressed =
      Phaser.Input.Keyboard.JustDown(this.interactKey) ||
      this.touchInteractPending;
    this.touchInteractPending = false;

    // ── Camera follows the local player ───────────────────────────────────
    if (this.localSessionId) {
      const local = this.players.get(this.localSessionId);
      if (local) {
        this.cameras.main.centerOn(
          Phaser.Math.Clamp(local.x, GAME_WIDTH / 2, (this.physics.world.bounds.width || GAME_WIDTH) - GAME_WIDTH / 2),
          GAME_HEIGHT / 2,
        );
      }
    }

    if (this.room === null) return;

    // ── Send input to server ───────────────────────────────────────────────
    const input: InputMessage = {
      left: movingLeft,
      right: movingRight,
      jump: jumpPressed,
      interact: interactPressed,
      sequence: this.inputSequence++,
    };
    this.room.send('input', input);
  }

  /**
   * Spectator camera:
   *  - Arrow keys / A / D → manual pan
   *  - Otherwise auto-follows the first active player (keeps the action in frame)
   */
  private updateSpectatorCamera(delta: number): void {
    const mw = this.physics.world.bounds.width || GAME_WIDTH;
    const half = GAME_WIDTH / 2;
    const clamp = (x: number) => Phaser.Math.Clamp(x, half, Math.max(half, mw - half));

    const movingLeft  = this.cursors.left.isDown  || this.wasd.left.isDown  || this.touchLeft;
    const movingRight = this.cursors.right.isDown || this.wasd.right.isDown || this.touchRight;

    if (movingLeft || movingRight) {
      const dir = (movingRight ? 1 : 0) - (movingLeft ? 1 : 0);
      this.spectatorCameraX = clamp(this.spectatorCameraX + dir * 0.6 * delta);
    } else {
      // Auto-follow: center on the first (lowest-id) active player, if any.
      const ids = Array.from(this.players.keys()).sort();
      const firstId = ids[0];
      const target = firstId ? this.players.get(firstId) : undefined;
      if (target) {
        this.spectatorCameraX = clamp(
          Phaser.Math.Linear(this.spectatorCameraX, target.x, 0.08),
        );
      }
    }

    this.cameras.main.centerOn(this.spectatorCameraX, GAME_HEIGHT / 2);
  }

  // ─── Network ─────────────────────────────────────────────────────────────────

  private async connect(): Promise<void> {
    const room = await this.network.joinOrCreate('game_room', {
      name: `Player ${Math.floor(Math.random() * 100)}`,
    });
    this.room = room;
    this.localSessionId = room.sessionId;
    this.subscribeToRoom();
  }

  /**
   * Wraps `room.onMessage` so every handler skips silently when the scene is
   * no longer active. Colyseus doesn't unregister handlers on scene stop, so
   * after a scene.start('LobbyScene') the old handlers keep firing and would
   * otherwise touch destroyed sprites / a stale `this.add`, throwing.
   */
  private onRoomMessage<T>(room: Room, type: string, handler: (data: T) => void): void {
    room.onMessage(type, (data: T) => {
      if (!this.scene.isActive('GameScene')) return;
      handler(data);
    });
  }

  private subscribeToRoom(): void {
    const room = this.room!;

    // ── Room code for HUD ─────────────────────────────────────────────────
    // The authoritative source is the network wrapper (captures the 'roomCode'
    // message before any scene transition can race it). Schema reads are only
    // a fallback in case the message is somehow missed.
    const applyCode = (): void => {
      const code = this.network.getRoomCode()
        || (room.state as NetworkGameState).roomCode;
      if (code) this.ui()?.setConnected(code);
    };
    this.time.delayedCall(50, applyCode);
    this.time.delayedCall(250, applyCode);
    room.onStateChange.once(() => {
      if (!this.scene.isActive('GameScene')) return;
      applyCode();
    });

    // ── Player roster ─────────────────────────────────────────────────────
    // Server broadcasts playerList on join/leave and every 5 ticks.
    // We create/destroy player sprites here; positions come from 'positions'.
    this.onRoomMessage<PlayerListMsg>(room, 'playerList', (data) => {
      // Track host so only the host sees interactive pack-complete buttons.
      this.isHost = !this.isSpectator && data.hostId === this.localSessionId;
      const knownIds = new Set(data.players.map((p) => p.id));

      // Remove sprites for players no longer in the room
      this.players.forEach((_, id) => {
        if (!knownIds.has(id)) {
          this.players.get(id)?.destroy();
          this.players.delete(id);
        }
      });

      // Create sprites for new players; update colors/names for existing ones
      for (const p of data.players) {
        const existing = this.players.get(p.id);
        if (existing) {
          existing.updateColor(p.color, this);
          existing.updateName(p.name);
        } else {
          // Pre-generate texture for this color so the sprite is ready
          generatePlayerSpritesheet(this, p.color);
          registerPlayerAnims(this, p.color);

          // Spawn at a neutral position; first 'positions' message will move them
          const spawn = { x: TILE_SIZE * 2, y: GAME_HEIGHT - TILE_SIZE * 2 };
          const sprite = new Player(this, spawn.x, spawn.y, p.color, p.name);

          // Play jump sound when the LOCAL player takes off
          if (p.id === this.localSessionId) {
            sprite.onJump = () => playJump();
          }

          this.players.set(p.id, sprite);
        }
      }

      this.ui()?.updatePlayerCount(data.players.length);
    });

    // ── Position updates (server sends every tick at 20 Hz) ───────────────
    // ALL players are updated here — local and remote alike.
    // This is the single source of truth for rendered positions, which
    // guarantees every client sees every player at the same location.
    this.onRoomMessage<PositionMsg[]>(room, 'positions', (list) => {
      for (const pos of list) {
        this.players.get(pos.id)?.receiveServerPosition(
          pos.x,
          pos.y,
          pos.vx,
          pos.grounded,
        );
      }
    });

    // ── Interactive object state changes ───────────────────────────────────
    this.onRoomMessage<Array<{ id: string; activated: boolean }>>(room, 'objectStates', (list) => {
      for (const s of list) {
        const obj = this.interactiveObjects.get(s.id);
        if (!obj) continue;
        obj.sync({ activated: s.activated });

        // Door opening → subtle shake for feedback
        if (obj.type === 'door') {
          const prev = this.doorPrevActivated.get(s.id) ?? false;
          if (s.activated && !prev) this.cameras.main.shake(180, 0.006);
          this.doorPrevActivated.set(s.id, s.activated);
        }
      }
    });

    // ── Level complete ─────────────────────────────────────────────────────
    this.onRoomMessage<{
      playerName: string;
      timeMs?: number;
      levelId?: number;
      newRecordRank?: number | null;
      top?: Array<{ timeMs: number; players: string[]; completedAt: string }>;
    }>(room, 'levelComplete', (data) => {
      this.showLevelComplete(
        data.playerName,
        data.top ?? [],
        data.newRecordRank ?? null,
      );
    });

    // ── Level transition ───────────────────────────────────────────────────
    this.onRoomMessage<{ levelId: number; mapWidth?: number }>(room, 'levelStart', (data) => {
      this.rebuildLevel(data.levelId, data.mapWidth);
    });

    // ── Trap hit — flash red then server will restart ──────────────────────
    this.onRoomMessage<void>(room, 'trapHit', () => {
      this.cameras.main.flash(400, 255, 0, 0, false);
    });

    // ── Spring bounce — play sound and squash-animate the pad ──────────────
    this.onRoomMessage<{ id: string; playerId: string }>(room, 'springBounce', (data) => {
      playSpring();
      this.interactiveObjects.get(data.id)?.playBounceAnim();
    });

    // ── Moving platform position updates (server sends each tick) ──────────
    // Schema doesn't sync platform x/y (motion is server-only); this message
    // carries the authoritative current position so clients render them.
    this.onRoomMessage<Array<{ id: string; x: number; y: number }>>(room, 'platformPositions', (list) => {
      for (const p of list) {
        this.interactiveObjects.get(p.id)?.setPosition(p.x, p.y);
      }
    });

    // ── Pickup/throw events — feedback sounds + floating label text ────────
    this.onRoomMessage<{ carrierId: string; carriedId: string }>(room, 'pickup', (data) => {
      this.showCarryFloater(data.carrierId, 'PICK UP', 0x88ddff);
    });
    this.onRoomMessage<{ carrierId: string }>(room, 'throw', (data) => {
      this.showCarryFloater(data.carrierId, 'THROW!', 0xffbb33);
    });

    // ── End of pack — show pack-complete picker, cancel stale fade ─────────
    this.onRoomMessage<{
      completedPackId: string;
      completedPackName: string;
      recommendedNextId: string | null;
      availablePacks: Array<{ id: string; name: string; minPlayers: number }>;
    }>(room, 'packComplete', (data) => {
      this.showPackComplete(data);
    });

    // ── Host asked to return to lobby — swap scenes, keep the room alive ───
    this.onRoomMessage<void>(room, 'returnToLobby', () => {
      this.goBackToLobby();
    });

    // ── Start-game errors bubble up here too (e.g. continuePack w/ too few players)
    this.onRoomMessage<{ message: string }>(room, 'startError', (data) => {
      this.showPackError(data.message);
    });

    console.log(`[GameScene] Connected → room ${room.id} (${room.sessionId})`);
  }

  // ─── Level management ─────────────────────────────────────────────────────────

  private loadLevelObjects(objects: LevelObjectDef[]): void {
    this.interactiveObjects.forEach((o) => o.destroy());
    this.interactiveObjects.clear();
    this.doorGroup.clear(true, true);
    this.doorPrevActivated.clear();
    this.goalPosition = null;

    for (const def of objects) {
      const iObj = new InteractiveObject(
        this,
        {
          id: def.id,
          type: def.type,
          x: def.x,
          y: def.y,
          width: def.width,
          height: def.height,
          activated: false,
          requiredPlayers: def.requiredPlayers,
          linkedId: def.linkedId,
          latching: def.latching ?? false,
        },
        def.type === 'door' ? this.doorGroup : undefined,
      );
      this.interactiveObjects.set(def.id, iObj);

      if (def.type === 'door') this.doorPrevActivated.set(def.id, false);
      if (def.type === 'goal') this.goalPosition = { x: def.x, y: def.y };
    }
  }

  private rebuildLevel(levelId: number, mapWidth?: number): void {
    const allLevels: LevelData[] = ALL_PACKS.flatMap((p) => p.levels);
    const levelData = allLevels.find((l) => l.id === levelId) ?? ALL_PACKS[0]!.levels[0]!;
    const mw = mapWidth ?? levelData.mapWidth ?? GAME_WIDTH;

    this.physics.world.setBounds(0, 0, mw, GAME_HEIGHT);
    this.cameras.main.setBounds(0, 0, mw, GAME_HEIGHT);

    // Kill a pending fadeOut so it can't fire after we've already faded back
    // in — a lingering stale call was the root cause of the old black-screen
    // lockup at the end of a pack.
    this.levelCompleteFadeTimer?.remove(false);
    this.levelCompleteFadeTimer = null;

    // Clear level-complete + pack-complete overlays (rebuild means we're done)
    this.levelCompleteOverlay.forEach((obj) => obj.destroy());
    this.levelCompleteOverlay = [];
    this.clearPackCompleteOverlay();

    // Rebuild tile geometry
    this.tiles.clear(true, true);
    this.buildSolidRects(levelData.solidRects);
    this.tiles.refresh();

    // Rebuild interactive objects for new level
    this.loadLevelObjects(levelData.objects);

    // Player positions come from the server's next 'positions' broadcast —
    // no manual reset needed; they'll interpolate to the new spawn points.

    // Fade back in — the complement of the fade-out fired on levelComplete
    this.cameras.main.fadeIn(420, 0, 0, 0);

    this.levelStartTime = Date.now();
    console.log(`[GameScene] Rebuilt → Level ${levelId}`);
  }

  // ─── Level complete overlay ───────────────────────────────────────────────────

  private showLevelComplete(
    winnerName: string,
    top: Array<{ timeMs: number; players: string[]; completedAt: string }>,
    newRecordRank: number | null,
  ): void {
    playLevelComplete();

    // Screen shake + particle burst at the goal for impact
    this.cameras.main.shake(420, 0.010);
    this.emitGoalBurst();

    // Fade to black just before the server sends the next level (5 s delay).
    // rebuildLevel() will fade back in on arrival of levelStart. We keep the
    // handle so it can be cancelled — otherwise a stale fire (e.g. at the end
    // of a pack) locks the screen black with audio still playing.
    this.levelCompleteFadeTimer?.remove(false);
    this.levelCompleteFadeTimer = this.time.delayedCall(4400, () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.levelCompleteFadeTimer = null;
    });

    const elapsedMs = Date.now() - this.levelStartTime;
    const timeStr = this.formatTime(elapsedMs);

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const bg = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.78).setDepth(20).setScrollFactor(0);
    const t1 = this.add.text(cx, cy - 140, 'LEVEL COMPLETE!', {
      ...FONT, fontSize: '28px', color: '#ffd700',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);
    const t2 = this.add.text(cx, cy - 94, `${winnerName} reached the goal`, {
      ...FONT, fontSize: '12px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);
    const t3 = this.add.text(cx, cy - 68, `Time: ${timeStr}`, {
      ...FONT, fontSize: '14px', color: '#00ff88',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);

    this.levelCompleteOverlay = [bg, t1, t2, t3];

    if (newRecordRank !== null) {
      const badge = this.add.text(cx, cy - 40, `NEW RECORD — RANK ${newRecordRank}`, {
        ...FONT, fontSize: '14px', color: '#ffcc66',
      }).setOrigin(0.5).setDepth(21).setScrollFactor(0);
      this.tweens.add({ targets: badge, alpha: { from: 1, to: 0.4 }, yoyo: true, repeat: -1, duration: 500 });
      this.levelCompleteOverlay.push(badge);
    }

    // Top 3 leaderboard entries for this level
    const header = this.add.text(cx, cy + 0, 'TOP TIMES', {
      ...FONT, fontSize: '12px', color: '#ffcc66',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);
    this.levelCompleteOverlay.push(header);

    const medals = ['1st', '2nd', '3rd'];
    top.slice(0, 3).forEach((entry, i) => {
      const names = entry.players.slice(0, 2).join(', ') || '(anon)';
      const line = this.add.text(cx, cy + 24 + i * 20, `${medals[i]}  ${this.formatTime(entry.timeMs)}  —  ${names}`, {
        ...FONT, fontSize: '10px', color: i === 0 ? '#ffffff' : '#bbbbbb',
      }).setOrigin(0.5).setDepth(21).setScrollFactor(0);
      this.levelCompleteOverlay.push(line);
    });

    if (top.length === 0) {
      const noData = this.add.text(cx, cy + 24, '(no times recorded yet)', {
        ...FONT, fontSize: '9px', color: '#888888',
      }).setOrigin(0.5).setDepth(21).setScrollFactor(0);
      this.levelCompleteOverlay.push(noData);
    }

    const footer = this.add.text(cx, cy + 110, 'Next level loading...', {
      ...FONT, fontSize: '9px', color: '#888888',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);
    this.levelCompleteOverlay.push(footer);
  }

  // ─── Pack-complete overlay ────────────────────────────────────────────────────

  private clearPackCompleteOverlay(): void {
    this.packCompleteOverlay.forEach((o) => o.destroy());
    this.packCompleteOverlay = [];
  }

  /**
   * Shown at the end of a pack. Replaces the level-complete fade-out with
   * an interactive picker: host clicks a pack to continue, others see a
   * "waiting for host" note. Host also has a BACK TO LOBBY button.
   */
  private showPackComplete(data: {
    completedPackId: string;
    completedPackName: string;
    recommendedNextId: string | null;
    availablePacks: Array<{ id: string; name: string; minPlayers: number }>;
  }): void {
    // Cancel any stale fade-to-black and ensure the camera is visible —
    // the level-complete overlay may have already triggered it.
    this.levelCompleteFadeTimer?.remove(false);
    this.levelCompleteFadeTimer = null;
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Tear down the level-complete overlay first — ours replaces it.
    this.levelCompleteOverlay.forEach((obj) => obj.destroy());
    this.levelCompleteOverlay = [];
    this.clearPackCompleteOverlay();

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const bg = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85)
      .setDepth(20).setScrollFactor(0);
    const title = this.add.text(cx, 90, 'PACK COMPLETE!', {
      ...FONT, fontSize: '32px', color: '#ffd700',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);
    const sub = this.add.text(cx, 140, `Finished "${data.completedPackName}"`, {
      ...FONT, fontSize: '12px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);

    this.packCompleteOverlay.push(bg, title, sub);

    const prompt = this.isHost
      ? 'Pick the next pack:'
      : 'Waiting for host to pick the next pack...';
    const promptText = this.add.text(cx, 186, prompt, {
      ...FONT, fontSize: '11px', color: '#ffcc66',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);
    this.packCompleteOverlay.push(promptText);

    // Card grid — 2 columns, up to 4 rows. Cards list pack name + minPlayers.
    // Recommended pack gets a highlighted border + "RECOMMENDED" tag.
    const CARD_W = 300;
    const CARD_H = 66;
    const GAP_X = 28;
    const GAP_Y = 16;
    const COLS = 2;
    const startY = 230;

    data.availablePacks.forEach((pack, i) => {
      const row = Math.floor(i / COLS);
      const col = i % COLS;
      const totalWidth = COLS * CARD_W + (COLS - 1) * GAP_X;
      const x = cx - totalWidth / 2 + col * (CARD_W + GAP_X) + CARD_W / 2;
      const y = startY + row * (CARD_H + GAP_Y);
      const isRecommended = pack.id === data.recommendedNextId;
      this.createPackCard(x, y, CARD_W, CARD_H, pack, isRecommended);
    });

    if (data.availablePacks.length === 0) {
      const none = this.add.text(cx, startY + 30, '(no packs available — not enough players)', {
        ...FONT, fontSize: '10px', color: '#aa7766',
      }).setOrigin(0.5).setDepth(21).setScrollFactor(0);
      this.packCompleteOverlay.push(none);
    }

    // Bottom row: BACK TO LOBBY (host only, non-hosts just see status).
    if (this.isHost) {
      const btn = this.add.rectangle(cx, GAME_HEIGHT - 60, 280, 38, 0x553333, 0.9)
        .setStrokeStyle(2, 0xff6666).setDepth(21).setScrollFactor(0).setInteractive();
      const lbl = this.add.text(cx, GAME_HEIGHT - 60, 'BACK TO LOBBY', {
        ...FONT, fontSize: '11px', color: '#ffaaaa',
      }).setOrigin(0.5).setDepth(22).setScrollFactor(0);
      btn.on('pointerover', () => btn.setFillStyle(0x774444, 0.95));
      btn.on('pointerout',  () => btn.setFillStyle(0x553333, 0.9));
      btn.on('pointerdown', () => {
        if (!this.room) return;
        this.room.send('returnToLobby', {});
      });
      this.packCompleteOverlay.push(btn, lbl);
    }
  }

  /** One clickable card in the pack-complete grid. */
  private createPackCard(
    x: number, y: number, w: number, h: number,
    pack: { id: string; name: string; minPlayers: number },
    recommended: boolean,
  ): void {
    const fill = recommended ? 0x1b4b1b : 0x202040;
    const stroke = recommended ? 0x88ff88 : 0x6666aa;

    const card = this.add.rectangle(x, y, w, h, fill, 0.95)
      .setStrokeStyle(2, stroke).setDepth(21).setScrollFactor(0);
    const nameText = this.add.text(x, y - 12, pack.name.toUpperCase(), {
      ...FONT, fontSize: '14px', color: recommended ? '#aaffaa' : '#ffffff',
    }).setOrigin(0.5).setDepth(22).setScrollFactor(0);
    const meta = this.add.text(x, y + 14, `min ${pack.minPlayers} players`, {
      ...FONT, fontSize: '9px', color: '#bbbbbb',
    }).setOrigin(0.5).setDepth(22).setScrollFactor(0);

    this.packCompleteOverlay.push(card, nameText, meta);

    if (recommended) {
      const tag = this.add.text(x + w / 2 - 8, y - h / 2 + 10, 'RECOMMENDED', {
        ...FONT, fontSize: '7px', color: '#002200', backgroundColor: '#aaffaa',
      }).setOrigin(1, 0.5).setPadding(4, 2, 4, 2).setDepth(23).setScrollFactor(0);
      this.packCompleteOverlay.push(tag);
    }

    if (!this.isHost) return;

    // Host-only interactivity.
    card.setInteractive({ useHandCursor: true });
    card.on('pointerover', () => card.setFillStyle(recommended ? 0x276b27 : 0x333358, 0.95));
    card.on('pointerout',  () => card.setFillStyle(fill, 0.95));
    card.on('pointerdown', () => {
      if (!this.room) return;
      this.room.send('continuePack', { packId: pack.id });
    });
  }

  /** Error toast — sits below the card grid, fades after a few seconds. */
  private showPackError(message: string): void {
    const cx = GAME_WIDTH / 2;
    const t = this.add.text(cx, GAME_HEIGHT - 110, message, {
      fontFamily: '"Press Start 2P"', fontSize: '10px',
      color: '#ffaaaa', backgroundColor: '#330000',
    }).setOrigin(0.5).setPadding(6, 4, 6, 4).setDepth(25).setScrollFactor(0);
    this.tweens.add({
      targets: t, alpha: { from: 1, to: 0 }, delay: 2400, duration: 600,
      onComplete: () => t.destroy(),
    });
  }

  /** Return to the lobby after host confirms. Cleans up, then hands the
   * pre-connected room off to LobbyScene so we don't have to reconnect. */
  private goBackToLobby(): void {
    this.levelCompleteFadeTimer?.remove(false);
    this.levelCompleteFadeTimer = null;
    this.clearPackCompleteOverlay();
    this.levelCompleteOverlay.forEach((o) => o.destroy());
    this.levelCompleteOverlay = [];

    stopBgMusic();

    if (!this.room || !this.network) return;
    const room = this.room;
    const network = this.network;
    const isSpectator = this.isSpectator;

    // Null our reference so the SHUTDOWN cleanup in this scene doesn't leave
    // the room. LobbyScene will adopt the same room instance.
    this.room = null;

    this.scene.start('LobbyScene', { room, network, isSpectator });
  }

  private formatTime(ms: number): string {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const cs = Math.floor((ms % 1000) / 10);
    return `${mins}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  }

  private ui(): UIScene | null {
    return this.scene.get('UIScene') as UIScene | null;
  }

  // ─── Cleanup ──────────────────────────────────────────────────────────────────

  private cleanup(): void {
    stopBgMusic();
    if (this.room !== null) {
      void this.room.leave();
      this.room = null;
    }
    this.players.forEach((s) => s.destroy());
    this.players.clear();
    this.interactiveObjects.forEach((o) => o.destroy());
    this.interactiveObjects.clear();
    this.scene.stop('UIScene');
  }

  // ─── Tile texture generation ──────────────────────────────────────────────────

  private generateTileTextures(): void {
    if (!this.textures.exists('tile_ground')) {
      const g = this.add.graphics();
      g.fillStyle(0x7c4f1e);
      g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      g.fillStyle(0x5aad32);
      g.fillRect(0, 0, TILE_SIZE, 3);
      g.fillStyle(0x3d8a1e);
      g.fillRect(0, 3, TILE_SIZE, 1);
      g.generateTexture('tile_ground', TILE_SIZE, TILE_SIZE);
      g.destroy();
    }
    if (!this.textures.exists('tile_platform')) {
      const g = this.add.graphics();
      g.fillStyle(0x8888aa);
      g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      g.fillStyle(0xaaaacc);
      g.fillRect(0, 0, TILE_SIZE, 2);
      g.fillStyle(0x555577);
      g.fillRect(0, TILE_SIZE - 2, TILE_SIZE, 2);
      g.generateTexture('tile_platform', TILE_SIZE, TILE_SIZE);
      g.destroy();
    }
    if (!this.textures.exists('door_body')) {
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 1);
      g.fillRect(0, 0, 1, 1);
      g.generateTexture('door_body', 1, 1);
      g.destroy();
    }

    // Cloud textures — two sizes for two parallax layers.
    // Each tile is a short repeating strip with soft white blobs.
    if (!this.textures.exists('cloud_far')) {
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 0.25);
      g.fillCircle(40,  36, 22);
      g.fillCircle(70,  30, 26);
      g.fillCircle(100, 40, 20);
      g.fillCircle(180, 20, 18);
      g.fillCircle(210, 28, 24);
      g.fillCircle(245, 22, 16);
      g.generateTexture('cloud_far', 256, 80);
      g.destroy();
    }
    if (!this.textures.exists('cloud_near')) {
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 0.45);
      g.fillCircle(50,  70, 30);
      g.fillCircle(90,  60, 36);
      g.fillCircle(130, 72, 28);
      g.fillCircle(230, 55, 26);
      g.fillCircle(270, 68, 34);
      g.fillCircle(310, 58, 24);
      g.generateTexture('cloud_near', 384, 110);
      g.destroy();
    }

    // Tiny 4×4 white square used for the goal particle burst
    if (!this.textures.exists('burst_dot')) {
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 1);
      g.fillRect(0, 0, 4, 4);
      g.generateTexture('burst_dot', 4, 4);
      g.destroy();
    }
  }

  // ─── Parallax background ──────────────────────────────────────────────────────

  private createParallaxBackground(): void {
    // Solid sky behind everything — covers the whole viewport regardless of pan.
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x67aee0)
      .setScrollFactor(0)
      .setDepth(-30);

    // Two TileSprites pinned to the camera; tilePositionX updates in update()
    // to create the parallax drift. scrollFactor=0 keeps them on-screen for
    // any map width, far layer slower than near layer.
    this.parallaxFar = this.add.tileSprite(GAME_WIDTH / 2, 140, GAME_WIDTH, 80, 'cloud_far')
      .setScrollFactor(0)
      .setDepth(-20);

    this.parallaxNear = this.add.tileSprite(GAME_WIDTH / 2, 220, GAME_WIDTH, 110, 'cloud_near')
      .setScrollFactor(0)
      .setDepth(-10);
  }

  // ─── Goal particle burst ──────────────────────────────────────────────────────

  private emitGoalBurst(): void {
    if (!this.goalPosition) return;
    const { x, y } = this.goalPosition;
    const emitter = this.add.particles(x, y, 'burst_dot', {
      speed: { min: 120, max: 260 },
      angle: { min: 0, max: 360 },
      lifespan: { min: 500, max: 900 },
      scale: { start: 2, end: 0 },
      gravityY: 420,
      tint: [0xffd700, 0xffffff, 0xffa800],
      emitting: false,
    });
    emitter.setDepth(10);
    emitter.explode(40);
    // Clean up the emitter after the last particle dies
    this.time.delayedCall(1200, () => emitter.destroy());
  }

  // ─── Touch controls ───────────────────────────────────────────────────────────

  private createTouchControls(): void {
    const H = GAME_HEIGHT;
    const BTN = 32;
    const alpha = 0.35;
    const FONT = { fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#ffffff' };

    const makeBtn = (
      x: number, y: number, label: string,
      onDown: () => void, onUp: () => void,
    ): void => {
      const bg = this.add
        .rectangle(x, y, BTN, BTN, 0xffffff, alpha)
        .setScrollFactor(0).setDepth(30).setInteractive();
      this.add.text(x, y, label, FONT)
        .setOrigin(0.5).setScrollFactor(0).setDepth(31);
      bg.on('pointerdown', onDown);
      bg.on('pointerup', onUp);
      bg.on('pointerout', onUp);
    };

    makeBtn(22, H - 20, '<',
      () => { this.touchLeft = true; },
      () => { this.touchLeft = false; },
    );
    makeBtn(58, H - 20, '>',
      () => { this.touchRight = true; },
      () => { this.touchRight = false; },
    );
    makeBtn(GAME_WIDTH - 22, H - 20, 'A',
      () => { this.touchJumpPending = true; },
      () => { /* one-shot */ },
    );
    makeBtn(GAME_WIDTH - 58, H - 20, 'E',
      () => { this.touchInteractPending = true; },
      () => { /* one-shot */ },
    );
  }

  // ─── Pickup/throw floating label ──────────────────────────────────────────────

  /** Pop a short text label above the carrier sprite to signal a pickup/throw. */
  private showCarryFloater(carrierId: string, text: string, colorHex: number): void {
    const sprite = this.players.get(carrierId);
    if (!sprite) return;
    const colorStr = '#' + colorHex.toString(16).padStart(6, '0');
    const label = this.add.text(sprite.x, sprite.y - 40, text, {
      fontFamily: '"Press Start 2P"',
      fontSize: '8px',
      color: colorStr,
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(6);
    this.tweens.add({
      targets: label,
      y: label.y - 18,
      alpha: { from: 1, to: 0 },
      duration: 700,
      ease: 'Cubic.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  // ─── Level geometry ───────────────────────────────────────────────────────────

  private buildSolidRects(solidRects: SolidRect[]): void {
    for (const rect of solidRects) {
      const textureKey = rect.tileType === 'ground' ? 'tile_ground' : 'tile_platform';
      const numTiles = Math.round(rect.width / TILE_SIZE);
      for (let i = 0; i < numTiles; i++) {
        const x = rect.x + i * TILE_SIZE + TILE_SIZE / 2;
        const y = rect.y + TILE_SIZE / 2;
        this.tiles.create(x, y, textureKey);
      }
    }
  }
}
