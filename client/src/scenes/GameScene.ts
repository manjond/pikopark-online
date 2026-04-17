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
import { playJump, playLevelComplete, startBgMusic, stopBgMusic } from '../utils/SoundSystem';

interface GameSceneData {
  room?: Room;
  network?: ColyseusClient;
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

  // ── Input ──────────────────────────────────────────────────────────────────
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    up: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  // ── Network ────────────────────────────────────────────────────────────────
  private network!: ColyseusClient;
  private room: Room | null = null;
  private localSessionId = '';
  private inputSequence = 0;

  // ── Level-complete overlay ─────────────────────────────────────────────────
  private levelCompleteOverlay: Phaser.GameObjects.GameObject[] = [];

  // ── Touch controls ─────────────────────────────────────────────────────────
  private touchLeft = false;
  private touchRight = false;
  private touchJumpPending = false;

  // ── Timing ────────────────────────────────────────────────────────────────
  private levelStartTime = 0;

  // ── Pre-connected room from LobbyScene ────────────────────────────────────
  private preConnectedRoom: Room | null = null;
  private preConnectedNetwork: ColyseusClient | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameSceneData): void {
    this.preConnectedRoom = data.room ?? null;
    this.preConnectedNetwork = data.network ?? null;
  }

  create(): void {
    const startLevel = ALL_PACKS[0]?.levels[0];

    this.physics.world.setBounds(0, 0, startLevel?.mapWidth ?? GAME_WIDTH, GAME_HEIGHT);
    this.cameras.main.setBounds(0, 0, startLevel?.mapWidth ?? GAME_WIDTH, GAME_HEIGHT);

    // ── Level geometry ─────────────────────────────────────────────────────
    this.generateTileTextures();
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

    this.scene.launch('UIScene');
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);

    startBgMusic();
    this.levelStartTime = Date.now();
    this.createTouchControls();

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
    // ── Read inputs ────────────────────────────────────────────────────────
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.up) ||
      this.touchJumpPending;
    this.touchJumpPending = false;

    const movingLeft  = this.cursors.left.isDown  || this.wasd.left.isDown  || this.touchLeft;
    const movingRight = this.cursors.right.isDown || this.wasd.right.isDown || this.touchRight;

    // ── Advance all player sprites (lerp toward server target) ────────────
    this.players.forEach((p) => p.tick(delta));

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
      interact: false,
      sequence: this.inputSequence++,
    };
    this.room.send('input', input);
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

  private subscribeToRoom(): void {
    const room = this.room!;

    // ── Room code for HUD ─────────────────────────────────────────────────
    room.onStateChange.once((s) => {
      const code = (s as NetworkGameState).roomCode;
      if (code) this.time.delayedCall(50, () => this.ui()?.setConnected(code));
    });
    this.time.delayedCall(250, () => {
      const code = (room.state as NetworkGameState).roomCode;
      if (code) this.ui()?.setConnected(code);
    });

    // ── Player roster ─────────────────────────────────────────────────────
    // Server broadcasts playerList on join/leave and every 5 ticks.
    // We create/destroy player sprites here; positions come from 'positions'.
    room.onMessage('playerList', (data: PlayerListMsg) => {
      const knownIds = new Set(data.players.map((p) => p.id));

      // Remove sprites for players no longer in the room
      this.players.forEach((_, id) => {
        if (!knownIds.has(id)) {
          this.players.get(id)?.destroy();
          this.players.delete(id);
        }
      });

      // Create sprites for new players; update colors for existing ones
      for (const p of data.players) {
        const existing = this.players.get(p.id);
        if (existing) {
          existing.updateColor(p.color, this);
        } else {
          // Pre-generate texture for this color so the sprite is ready
          generatePlayerSpritesheet(this, p.color);
          registerPlayerAnims(this, p.color);

          // Spawn at a neutral position; first 'positions' message will move them
          const spawn = { x: TILE_SIZE * 2, y: GAME_HEIGHT - TILE_SIZE * 2 };
          const sprite = new Player(this, spawn.x, spawn.y, p.color);

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
    room.onMessage('positions', (list: PositionMsg[]) => {
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
    room.onMessage('objectStates', (list: Array<{ id: string; activated: boolean }>) => {
      for (const s of list) {
        this.interactiveObjects.get(s.id)?.sync({ activated: s.activated });
      }
    });

    // ── Level complete ─────────────────────────────────────────────────────
    room.onMessage('levelComplete', (data: { playerName: string }) => {
      this.showLevelComplete(data.playerName);
    });

    // ── Level transition ───────────────────────────────────────────────────
    room.onMessage('levelStart', (data: { levelId: number; mapWidth?: number }) => {
      this.rebuildLevel(data.levelId, data.mapWidth);
    });

    // ── Trap hit — flash red then server will restart ──────────────────────
    room.onMessage('trapHit', () => {
      this.cameras.main.flash(400, 255, 0, 0, false);
    });

    console.log(`[GameScene] Connected → room ${room.id} (${room.sessionId})`);
  }

  // ─── Level management ─────────────────────────────────────────────────────────

  private loadLevelObjects(objects: LevelObjectDef[]): void {
    this.interactiveObjects.forEach((o) => o.destroy());
    this.interactiveObjects.clear();
    this.doorGroup.clear(true, true);

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
    }
  }

  private rebuildLevel(levelId: number, mapWidth?: number): void {
    const allLevels: LevelData[] = ALL_PACKS.flatMap((p) => p.levels);
    const levelData = allLevels.find((l) => l.id === levelId) ?? ALL_PACKS[0]!.levels[0]!;
    const mw = mapWidth ?? levelData.mapWidth ?? GAME_WIDTH;

    this.physics.world.setBounds(0, 0, mw, GAME_HEIGHT);
    this.cameras.main.setBounds(0, 0, mw, GAME_HEIGHT);

    // Clear level-complete overlay
    this.levelCompleteOverlay.forEach((obj) => obj.destroy());
    this.levelCompleteOverlay = [];

    // Rebuild tile geometry
    this.tiles.clear(true, true);
    this.buildSolidRects(levelData.solidRects);
    this.tiles.refresh();

    // Rebuild interactive objects for new level
    this.loadLevelObjects(levelData.objects);

    // Player positions come from the server's next 'positions' broadcast —
    // no manual reset needed; they'll interpolate to the new spawn points.

    this.levelStartTime = Date.now();
    console.log(`[GameScene] Rebuilt → Level ${levelId}`);
  }

  // ─── Level complete overlay ───────────────────────────────────────────────────

  private showLevelComplete(winnerName: string): void {
    playLevelComplete();

    const elapsedMs = Date.now() - this.levelStartTime;
    const totalSecs = Math.floor(elapsedMs / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const FONT = { fontFamily: '"Press Start 2P"' };

    const sf = { scrollFactorX: 0, scrollFactorY: 0 };
    const bg = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75).setDepth(20).setScrollFactor(0);
    const t1 = this.add.text(cx, cy - 34, 'LEVEL COMPLETE!', {
      ...FONT, fontSize: '10px', color: '#ffd700',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);
    const t2 = this.add.text(cx, cy - 12, `${winnerName} reached the goal`, {
      ...FONT, fontSize: '6px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);
    const t3 = this.add.text(cx, cy + 4, `Time: ${timeStr}`, {
      ...FONT, fontSize: '6px', color: '#00ff88',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);
    const t4 = this.add.text(cx, cy + 20, 'Next level loading...', {
      ...FONT, fontSize: '6px', color: '#888888',
    }).setOrigin(0.5).setDepth(21).setScrollFactor(0);
    void sf; // suppress unused warning

    this.levelCompleteOverlay = [bg, t1, t2, t3, t4];
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
