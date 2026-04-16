import Phaser from 'phaser';
import { Room } from 'colyseus.js';
import { Player } from '../entities/Player';
import { InteractiveObject } from '../entities/InteractiveObject';
import { applyMovement } from '../physics/PlatformerPhysics';
import {
  ColyseusClient,
  NetworkGameState,
  NetworkObject,
  NetworkPlayer,
} from '../network/ColyseusClient';
import type { UIScene } from './UIScene';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  TILE_SIZE,
  InputMessage,
  LEVEL_1,
  LEVEL_2,
  LEVEL_3,
  LEVEL_4,
  LEVEL_5,
  SolidRect,
} from '@pikopark/shared';
import {
  generatePlayerSpritesheet,
  registerPlayerAnims,
  resolveAnimKey,
} from '../utils/PlayerTextures';
import { playJump, playLevelComplete, startBgMusic, stopBgMusic } from '../utils/SoundSystem';

interface GameSceneData {
  room?: Room;
  network?: ColyseusClient;
}

export class GameScene extends Phaser.Scene {
  // ── Terrain ────────────────────────────────────────────────────────────────
  private tiles!: Phaser.Physics.Arcade.StaticGroup;

  // ── Local player — Arcade Physics, always present regardless of server ──────
  private localPlayer!: Phaser.Physics.Arcade.Sprite;
  private localColorIndex = 0;

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

  // ── Remote players rendered from server state (excludes local player) ───────
  private remotePlayers = new Map<string, Player>();

  // ── Interactive objects synced from server state ───────────────────────────
  private interactiveObjects = new Map<string, InteractiveObject>();
  private doorGroup!: Phaser.Physics.Arcade.StaticGroup;

  // ── Level-complete overlay (for dismissal on level change) ────────────────
  private levelCompleteOverlay: Phaser.GameObjects.GameObject[] = [];

  // ── Touch controls ────────────────────────────────────────────────────────
  private touchLeft = false;
  private touchRight = false;
  private touchJumpPending = false;

  // ── Level timing ──────────────────────────────────────────────────────────
  private levelStartTime = 0;

  // ── Pre-connected room from LobbyScene (optional) ─────────────────────────
  private preConnectedRoom: Room | null = null;
  private preConnectedNetwork: ColyseusClient | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  /** Receives the room pre-created in LobbyScene, if coming from the lobby. */
  init(data: GameSceneData): void {
    this.preConnectedRoom = data.room ?? null;
    this.preConnectedNetwork = data.network ?? null;
  }

  create(): void {
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Terrain
    this.generateTileTextures();
    this.tiles = this.physics.add.staticGroup();
    this.buildSolidRects(LEVEL_1.solidRects);
    this.tiles.refresh();

    // Door physics group — filled when server connects
    this.doorGroup = this.physics.add.staticGroup();

    // Local player — always present; server connection is additive
    this.localPlayer = this.spawnLocalPlayer();
    this.physics.add.collider(this.localPlayer, this.tiles);
    this.physics.add.collider(this.localPlayer, this.doorGroup);

    // Input
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

    // Use the lobby room if available; otherwise connect on our own.
    if (this.preConnectedRoom !== null) {
      this.network = this.preConnectedNetwork ?? new ColyseusClient();
      this.room = this.preConnectedRoom;
      this.localSessionId = this.room.sessionId;
      this.subscribeToRoom();
      this.syncLocalPlayerColor();
    } else {
      this.network = new ColyseusClient();
      this.connect().catch((err: unknown) => {
        console.warn('[GameScene] No server — running offline:', err);
        this.time.delayedCall(50, () => this.ui()?.setOffline());
      });
    }
  }

  update(_time: number, delta: number): void {
    const body = this.localPlayer.body as Phaser.Physics.Arcade.Body;

    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.up) ||
      this.touchJumpPending;
    this.touchJumpPending = false;

    if (jumpPressed && body.blocked.down) playJump();

    const movingLeft = this.cursors.left.isDown || this.wasd.left.isDown || this.touchLeft;
    const movingRight = this.cursors.right.isDown || this.wasd.right.isDown || this.touchRight;

    // Local physics always runs regardless of server
    applyMovement(body, movingLeft, movingRight, jumpPressed);

    // ── Drive local player animation ──────────────────────────────────────────
    const velX = body.velocity.x;
    const grounded = body.blocked.down;
    const animKey = resolveAnimKey(this.localColorIndex, velX, grounded);
    if (this.localPlayer.anims.currentAnim?.key !== animKey) {
      this.localPlayer.play(animKey);
    }
    // Flip to face direction of travel
    if (velX < -1) this.localPlayer.setFlipX(true);
    else if (velX > 1) this.localPlayer.setFlipX(false);

    // Advance remote player interpolation every frame
    this.remotePlayers.forEach((p) => p.tick(delta));

    if (this.room === null) return;

    // Send input to server
    const input: InputMessage = {
      left: movingLeft,
      right: movingRight,
      jump: jumpPressed,
      interact: false,
      sequence: this.inputSequence++,
    };
    this.room.send('input', input);

    const state = this.room.state as NetworkGameState;

    // Feed server positions + velocity into remote players (they lerp via tick)
    state.players.forEach((player: NetworkPlayer, sessionId: string) => {
      if (sessionId !== this.localSessionId) {
        this.remotePlayers.get(sessionId)?.receiveServerPosition(
          player.x,
          player.y,
          player.velocityX,
          player.isGrounded,
        );
      }
    });

    // Sync interactive object visuals and door physics
    state.interactiveObjects.forEach((obj: NetworkObject, id: string) => {
      this.interactiveObjects.get(id)?.sync(obj);
    });
  }

  // ─── Network ─────────────────────────────────────────────────────────────────

  /** Standalone connect path — used when entering directly without lobby. */
  private async connect(): Promise<void> {
    const room = await this.network.joinOrCreate('game_room', {
      name: `Player ${Math.floor(Math.random() * 100)}`,
    });
    this.room = room;
    this.localSessionId = room.sessionId;
    this.subscribeToRoom();
    this.syncLocalPlayerColor();
  }

  /** Subscribe to all room state events (shared by lobby-connected and standalone paths). */
  private subscribeToRoom(): void {
    const room = this.room!;

    // ── Level complete ────────────────────────────────────────────────────────
    room.onMessage('levelComplete', (data: { playerName: string }) => {
      this.showLevelComplete(data.playerName);
    });

    // ── Level start (transition to next level) ────────────────────────────────
    room.onMessage('levelStart', (data: { levelId: number }) => {
      this.rebuildLevel(data.levelId);
    });

    const state = room.state as NetworkGameState;

    // ── Remote players ─────────────────────────────────────────────────────────
    const addRemotePlayer = (player: NetworkPlayer, sessionId: string) => {
      if (sessionId === this.localSessionId) return;
      if (this.remotePlayers.has(sessionId)) return;
      const sprite = new Player(this, player.x, player.y, player.color);
      this.remotePlayers.set(sessionId, sprite);
      this.ui()?.updatePlayerCount(1 + this.remotePlayers.size);
    };
    // onAdd covers future joins; forEach bootstraps players already in the map
    // (happens when transitioning from LobbyScene with a pre-connected room)
    state.players.onAdd(addRemotePlayer);
    state.players.forEach(addRemotePlayer);

    state.players.onRemove((_player: NetworkPlayer, sessionId: string) => {
      this.remotePlayers.get(sessionId)?.destroy();
      this.remotePlayers.delete(sessionId);
      this.ui()?.updatePlayerCount(1 + this.remotePlayers.size);
    });

    // ── Interactive objects ────────────────────────────────────────────────────
    const addInteractiveObj = (obj: NetworkObject, id: string) => {
      if (this.interactiveObjects.has(id)) return;
      const iObj = new InteractiveObject(
        this,
        obj,
        obj.type === 'door' ? this.doorGroup : undefined,
      );
      this.interactiveObjects.set(id, iObj);
    };
    // onAdd covers future additions; forEach bootstraps pre-existing objects
    state.interactiveObjects.onAdd(addInteractiveObj);
    state.interactiveObjects.forEach(addInteractiveObj);

    state.interactiveObjects.onRemove((_obj: NetworkObject, id: string) => {
      this.interactiveObjects.get(id)?.destroy();
      this.interactiveObjects.delete(id);
    });

    // onStateChange fires on every server tick (20 Hz) — state.roomCode is
    // always populated (set once in onCreate, never changes), so the first
    // fired event reliably gives us the code on both the lobby→game path and
    // the standalone connect path.  50 ms sub-delay lets UIScene initialise.
    room.onStateChange.once((s) => {
      const code = (s as NetworkGameState).roomCode;
      if (code) this.time.delayedCall(50, () => this.ui()?.setConnected(code));
    });
    // Belt-and-suspenders: read state directly at 250 ms in case the first
    // onStateChange fired before the sub-delay resolved.
    this.time.delayedCall(250, () => {
      const code = (room.state as NetworkGameState).roomCode;
      if (code) this.ui()?.setConnected(code);
    });
    console.log(`[GameScene] Connected → room ${room.id} (${room.sessionId})`);
  }

  /**
   * Updates the local player's texture to match the server-assigned color.
   * The server picks a color by join order; this keeps local and remote views in sync.
   */
  private syncLocalPlayerColor(): void {
    const state = (this.room!.state as NetworkGameState);
    const myPlayer = state.players.get(this.localSessionId);
    if (!myPlayer) return;

    this.localColorIndex = myPlayer.color;
    generatePlayerSpritesheet(this, this.localColorIndex);
    registerPlayerAnims(this, this.localColorIndex);

    const sheetKey = `player_sheet_${this.localColorIndex}`;
    this.localPlayer.setTexture(sheetKey, 'idle');
    this.localPlayer.play(`player_idle_${this.localColorIndex}`);
  }

  // ─── Level management ─────────────────────────────────────────────────────────

  /**
   * Rebuilds tiles, interactive objects, and resets the local player
   * when the server transitions to a new level.
   */
  private rebuildLevel(levelId: number): void {
    const allLevels = [LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5];
    const levelData = allLevels.find((l) => l.id === levelId) ?? LEVEL_1;

    // Dismiss any level-complete overlay
    this.levelCompleteOverlay.forEach((obj) => obj.destroy());
    this.levelCompleteOverlay = [];

    // Rebuild tile geometry
    this.tiles.clear(true, true);
    this.buildSolidRects(levelData.solidRects);
    this.tiles.refresh();

    // Reset local player to first spawn point
    const spawn = levelData.spawnPoints[0] ?? {
      x: TILE_SIZE * 2,
      y: GAME_HEIGHT - TILE_SIZE * 3,
    };
    const body = this.localPlayer.body as Phaser.Physics.Arcade.Body;
    body.reset(spawn.x, spawn.y);

    this.levelStartTime = Date.now();
    console.log(`[GameScene] Rebuilt → Level ${levelId}`);
  }

  // ─── Level complete overlay ───────────────────────────────────────────────────

  private showLevelComplete(winnerName: string): void {
    playLevelComplete();
    this.cursors.left.reset();
    this.cursors.right.reset();
    this.cursors.up.reset();

    const elapsedMs = Date.now() - this.levelStartTime;
    const totalSecs = Math.floor(elapsedMs / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const FONT = { fontFamily: '"Press Start 2P"' };

    const bg = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75).setDepth(20);
    const t1 = this.add.text(cx, cy - 34, 'LEVEL COMPLETE!', {
      ...FONT, fontSize: '10px', color: '#ffd700',
    }).setOrigin(0.5).setDepth(21);
    const t2 = this.add.text(cx, cy - 12, `${winnerName} reached the goal`, {
      ...FONT, fontSize: '6px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(21);
    const t3 = this.add.text(cx, cy + 4, `Time: ${timeStr}`, {
      ...FONT, fontSize: '6px', color: '#00ff88',
    }).setOrigin(0.5).setDepth(21);
    const t4 = this.add.text(cx, cy + 20, 'Next level loading...', {
      ...FONT, fontSize: '6px', color: '#888888',
    }).setOrigin(0.5).setDepth(21);

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
    this.remotePlayers.forEach((s) => s.destroy());
    this.remotePlayers.clear();
    this.interactiveObjects.forEach((o) => o.destroy());
    this.interactiveObjects.clear();
    this.scene.stop('UIScene');
  }

  // ─── Local player setup ───────────────────────────────────────────────────────

  private spawnLocalPlayer(): Phaser.Physics.Arcade.Sprite {
    // Start with color 0; syncLocalPlayerColor() updates it once connected.
    generatePlayerSpritesheet(this, 0);
    registerPlayerAnims(this, 0);

    const spawn = LEVEL_1.spawnPoints[0] ?? { x: TILE_SIZE * 2, y: GAME_HEIGHT - TILE_SIZE * 3 };
    const sprite = this.physics.add.sprite(spawn.x, spawn.y, 'player_sheet_0', 'idle');
    sprite.play('player_idle_0');
    sprite.setCollideWorldBounds(true);
    sprite.setDepth(1);
    return sprite;
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
      () => { /* one-shot — reset in update */ },
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
