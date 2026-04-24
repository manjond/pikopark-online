import Phaser from 'phaser';
import { Room } from 'colyseus.js';
import { ColyseusClient } from '../network/ColyseusClient';
import { PLAYER_COLORS, ALL_PACKS } from '@pikopark/shared';
import { FONT } from '../ui/theme';

interface LobbyData {
  room: Room;
  network: ColyseusClient;
  isSpectator?: boolean;
}

interface ChatMessage {
  name: string;
  text: string;
}

interface LobbyPlayer {
  id: string;
  name: string;
  color: number;
}

interface LobbySpectator {
  id: string;
  name: string;
}

const MAX_CHAT = 7;

/** Player-count categories shown in the left panel. */
const CATEGORIES: { minPlayers: number; label: string }[] = [
  { minPlayers: 1, label: '1+ PLAYER' },
  { minPlayers: 2, label: '2+ PLAYERS' },
  { minPlayers: 4, label: '4+ PLAYERS' },
];

export class LobbyScene extends Phaser.Scene {
  private room!: Room;
  private network!: ColyseusClient;

  // ── Left panel ────────────────────────────────────────────────────────────
  private roomCodeText!: Phaser.GameObjects.Text;

  // ── Category selection (left panel) ───────────────────────────────────────
  private categoryButtons: Phaser.GameObjects.Text[] = [];
  private selectedCategory = 1;

  // ── Pack selection (right-top) ────────────────────────────────────────────
  private packButtonContainer!: Phaser.GameObjects.Container;
  private packInfoText!: Phaser.GameObjects.Text;
  private packErrorText!: Phaser.GameObjects.Text;
  private packHeaderText!: Phaser.GameObjects.Text;
  private packScrollBar?: Phaser.GameObjects.Rectangle;
  private selectedPackId = 'basics';

  // ── Pack grid layout + scroll state ───────────────────────────────────────
  private readonly PACK_COLS = 3;
  private readonly PACK_CARD_W = 224;
  private readonly PACK_CARD_H = 84;
  private readonly PACK_GAP = 14;
  private PACK_VISIBLE_TOP = 62;
  private PACK_VISIBLE_H = 250;
  private PACK_MASK_X = 0;
  private PACK_MASK_W = 0;
  private packContentHeight = 0;
  private packScrollY = 0;

  private playerListContainer!: Phaser.GameObjects.Container;
  private playerCountText!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Text;

  // ── Player roster from server ─────────────────────────────────────────────
  private lobbyPlayers: LobbyPlayer[] = [];
  private lobbySpectators: LobbySpectator[] = [];
  private isHost = false;
  private isSpectator = false;

  // ── Right panel — chat ────────────────────────────────────────────────────
  private chatMessages: ChatMessage[] = [];
  private typedMessage = '';
  private chatInputText!: Phaser.GameObjects.Text;
  private chatLinesContainer!: Phaser.GameObjects.Container;

  // Layout constants (computed in create from actual canvas size)
  private SPLIT = 0;     // x where left panel ends / right panel begins
  private RIGHT_SPLIT_Y = 0; // y where right panel splits into packs (top) / chat (bottom)

  constructor() {
    super({ key: 'LobbyScene' });
  }

  init(data: LobbyData): void {
    this.room = data.room;
    this.network = data.network;
    this.isSpectator = data.isSpectator === true;
  }

  create(): void {
    // Phaser scene instances are reused across `scene.start()` calls — the
    // constructor doesn't re-run, so any field holding GameObjects from a
    // previous visit will still point at destroyed objects. Reset anything
    // that's stateful before touching it below.
    this.categoryButtons = [];
    this.lobbyPlayers = [];
    this.lobbySpectators = [];
    this.chatMessages = [];
    this.typedMessage = '';
    this.selectedCategory = 1;
    this.selectedPackId = 'basics';
    this.packScrollY = 0;
    this.packContentHeight = 0;
    this.isHost = false;

    const W = this.cameras.main.width;   // 1280
    const H = this.cameras.main.height;  // 720

    this.SPLIT = Math.round(W * 0.38);            // ~486px left panel
    this.RIGHT_SPLIT_Y = Math.round(H * 0.5);     // 360 — packs above, chat below
    const lx = this.SPLIT / 2;
    const rx = this.SPLIT + (W - this.SPLIT) / 2;
    const chatW = W - this.SPLIT;

    // ── Background panels ─────────────────────────────────────────────────────
    this.add.rectangle(lx, H / 2, this.SPLIT, H, 0x111122);
    this.add.rectangle(rx, this.RIGHT_SPLIT_Y / 2, chatW, this.RIGHT_SPLIT_Y, 0x0d1117);
    this.add.rectangle(rx, this.RIGHT_SPLIT_Y + (H - this.RIGHT_SPLIT_Y) / 2, chatW, H - this.RIGHT_SPLIT_Y, 0x0a0d12);
    this.add.rectangle(this.SPLIT, H / 2, 2, H, 0x333355);  // vertical divider
    this.add.rectangle(rx, this.RIGHT_SPLIT_Y, chatW, 2, 0x333355);  // horizontal divider

    // ── Left panel: room info ─────────────────────────────────────────────────
    this.add.text(lx, 36, 'LOBBY', {
      ...FONT, fontSize: '28px', color: '#ffffff',
    }).setOrigin(0.5);

    this.roomCodeText = this.add.text(lx, 90, 'CODE: ....', {
      ...FONT, fontSize: '20px', color: '#00ff88',
    }).setOrigin(0.5);

    this.add.text(lx, 122, 'share this code with friends', {
      ...FONT, fontSize: '9px', color: '#444466',
    }).setOrigin(0.5);

    this.playerCountText = this.add.text(lx, 150, '0 / 8 players', {
      ...FONT, fontSize: '12px', color: '#888888',
    }).setOrigin(0.5);

    this.add.rectangle(lx, 172, this.SPLIT - 40, 2, 0x333355);

    // ── Player list ───────────────────────────────────────────────────────────
    this.playerListContainer = this.add.container(24, 182);

    // ── Category selector (replaces the old pack selector) ────────────────────
    this.add.rectangle(lx, H - 310, this.SPLIT - 40, 2, 0x333355);
    this.add.text(lx, H - 292, 'CATEGORY', {
      ...FONT, fontSize: '11px', color: '#888888',
    }).setOrigin(0.5);

    CATEGORIES.forEach((cat, i) => {
      const btnY = H - 258 + i * 42;
      const btn = this.add.text(lx, btnY, cat.label, {
        ...FONT, fontSize: '12px', color: '#555555',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerover', () => { if (cat.minPlayers !== this.selectedCategory) btn.setColor('#aaaaaa'); });
      btn.on('pointerout',  () => { if (cat.minPlayers !== this.selectedCategory) btn.setColor('#555555'); });
      btn.on('pointerdown', () => {
        if (!this.isHost) return;
        this.selectedCategory = cat.minPlayers;
        this.rebuildCategoryButtons();
        this.rebuildPackList();
      });
      this.categoryButtons.push(btn);
    });

    // ── Divider above buttons ─────────────────────────────────────────────────
    this.add.rectangle(lx, H - 100, this.SPLIT - 40, 2, 0x333355);

    // ── START GAME — visible only to host ─────────────────────────────────────
    this.startButton = this.add.text(lx, H - 76, 'START GAME', {
      ...FONT, fontSize: '20px', color: '#00ff00',
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    this.startButton.on('pointerover', () => this.startButton.setColor('#ffffff'));
    this.startButton.on('pointerout',  () => this.startButton.setColor('#00ff00'));
    this.startButton.on('pointerdown', () => { this.room.send('startGame', {}); });

    this.makeButton(lx, H - 32, 'LEAVE', '#666666', () => {
      void this.room.leave();
      this.scene.start('MenuScene');
    });

    // Spectator badge — shown in lieu of the pack/start controls when watching.
    if (this.isSpectator) {
      this.add.text(lx, H - 76, 'SPECTATING', {
        ...FONT, fontSize: '18px', color: '#ff99ee',
      }).setOrigin(0.5);
      this.add.text(lx, H - 50, 'waiting for host to start', {
        ...FONT, fontSize: '9px', color: '#666666',
      }).setOrigin(0.5);
    }

    // ── Right-top panel: PACKS ────────────────────────────────────────────────
    this.packHeaderText = this.add.text(rx, 26, 'PACKS — 1+ PLAYER', {
      ...FONT, fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5);

    this.add.rectangle(rx, 52, chatW - 40, 2, 0x333355);

    // Pack scrollable grid — mask clips overflow, wheel scrolls contents.
    this.PACK_MASK_X = this.SPLIT + 20;
    this.PACK_MASK_W = chatW - 40;
    this.PACK_VISIBLE_H = this.RIGHT_SPLIT_Y - this.PACK_VISIBLE_TOP - 50;

    this.packButtonContainer = this.add.container(this.PACK_MASK_X, this.PACK_VISIBLE_TOP);

    const maskShape = this.make.graphics({}, false);
    maskShape.fillStyle(0xffffff);
    maskShape.fillRect(this.PACK_MASK_X, this.PACK_VISIBLE_TOP, this.PACK_MASK_W, this.PACK_VISIBLE_H);
    this.packButtonContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, maskShape));

    this.packScrollBar = this.add.rectangle(
      this.PACK_MASK_X + this.PACK_MASK_W - 4, this.PACK_VISIBLE_TOP,
      3, this.PACK_VISIBLE_H, 0x444466,
    ).setOrigin(0, 0).setVisible(false);

    this.input.on('wheel', (pointer: Phaser.Input.Pointer, _gos: unknown, _dx: number, dy: number) => {
      if (!this.isPointerInPackArea(pointer)) return;
      const overflow = this.packContentHeight - this.PACK_VISIBLE_H;
      if (overflow <= 0) return;
      this.packScrollY = Phaser.Math.Clamp(this.packScrollY + dy * 0.5, 0, overflow);
      this.packButtonContainer.y = this.PACK_VISIBLE_TOP - this.packScrollY;
      this.updatePackScrollBar();
    });

    this.packInfoText = this.add.text(rx, this.RIGHT_SPLIT_Y - 44, '', {
      ...FONT, fontSize: '10px', color: '#888888',
    }).setOrigin(0.5);

    this.packErrorText = this.add.text(rx, this.RIGHT_SPLIT_Y - 24, '', {
      ...FONT, fontSize: '9px', color: '#ff4444',
    }).setOrigin(0.5);

    // ── Right-bottom panel: CHAT (half height) ────────────────────────────────
    this.add.text(rx, this.RIGHT_SPLIT_Y + 22, 'CHAT', {
      ...FONT, fontSize: '16px', color: '#aaaaaa',
    }).setOrigin(0.5);

    this.add.rectangle(rx, this.RIGHT_SPLIT_Y + 44, chatW - 40, 2, 0x333355);

    this.chatLinesContainer = this.add.container(this.SPLIT + 20, this.RIGHT_SPLIT_Y + 54);

    this.add.rectangle(rx, H - 44, chatW - 40, 2, 0x333355);
    this.chatInputText = this.add.text(this.SPLIT + 20, H - 32, '> _', {
      ...FONT, fontSize: '12px', color: '#00ccff',
      wordWrap: { width: chatW - 48 },
    });

    // ── Keyboard input ─────────────────────────────────────────────────────────
    this.input.keyboard!.on('keydown', this.handleKeydown, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard!.off('keydown', this.handleKeydown, this);
    });

    // ── Room messages ──────────────────────────────────────────────────────────
    this.room.onMessage('chat', (data: { name: string; text: string }) => {
      this.addChatMessage(data);
    });

    this.room.onMessage('roomCode', (data: { code: string }) => {
      this.roomCodeText.setText(`CODE: ${data.code}`);
    });

    // Network wrapper may already have the code cached if the roomCode message
    // fired before this scene attached its own handler (race at mid-game join).
    const cached = this.network.getRoomCode();
    if (cached) this.roomCodeText.setText(`CODE: ${cached}`);

    this.room.onMessage('playerList', (data: { players: LobbyPlayer[]; spectators?: LobbySpectator[]; hostId: string }) => {
      if (!this.scene.isActive('LobbyScene')) return;
      this.lobbyPlayers = data.players;
      this.lobbySpectators = data.spectators ?? [];
      // Spectators are never host, even if they somehow match the hostId.
      this.isHost = !this.isSpectator && data.hostId === this.room.sessionId;
      this.startButton.setVisible(this.isHost);
      this.rebuildPlayerList();
    });

    this.room.onMessage('gameStart', (data: { packId?: string; levelId?: number; mapWidth?: number } = {}) => {
      // roomCode arrives via message (not schema), so we pass the cached
      // value straight into GameScene — UIScene can show it immediately.
      this.scene.start('GameScene', {
        room: this.room,
        network: this.network,
        isSpectator: this.isSpectator,
        packId: data.packId ?? this.selectedPackId,
        levelId: data.levelId,
        mapWidth: data.mapWidth,
        roomCode: this.network.getRoomCode() || undefined,
      });
    });

    this.room.onMessage('packSelected', (data: { packId: string; name: string; minPlayers: number }) => {
      this.selectedPackId = data.packId;
      this.selectedCategory = data.minPlayers;
      this.packInfoText.setText(`${data.name} — min ${data.minPlayers} players`);
      this.packErrorText.setText('');
      this.rebuildCategoryButtons();
      this.rebuildPackList();
    });

    this.room.onMessage('startError', (data: { message: string }) => {
      this.packErrorText.setText(data.message);
    });

    // Initial render of category + pack buttons
    this.rebuildCategoryButtons();
    this.rebuildPackList();
  }

  // ── Category buttons (left panel) ─────────────────────────────────────────

  private rebuildCategoryButtons(): void {
    this.categoryButtons.forEach((btn, i) => {
      const cat = CATEGORIES[i]!;
      btn.setColor(cat.minPlayers === this.selectedCategory ? '#00ff88' : '#555555');
    });
  }

  // ── Pack grid (right-top panel) ───────────────────────────────────────────

  private isPointerInPackArea(pointer: Phaser.Input.Pointer): boolean {
    return pointer.x >= this.PACK_MASK_X
      && pointer.x <= this.PACK_MASK_X + this.PACK_MASK_W
      && pointer.y >= this.PACK_VISIBLE_TOP
      && pointer.y <= this.PACK_VISIBLE_TOP + this.PACK_VISIBLE_H;
  }

  private updatePackScrollBar(): void {
    if (!this.packScrollBar) return;
    const overflow = this.packContentHeight - this.PACK_VISIBLE_H;
    if (overflow <= 0) {
      this.packScrollBar.setVisible(false);
      return;
    }
    const ratio = this.PACK_VISIBLE_H / this.packContentHeight;
    const barH = Math.max(20, this.PACK_VISIBLE_H * ratio);
    const travel = this.PACK_VISIBLE_H - barH;
    const scrollFrac = overflow > 0 ? this.packScrollY / overflow : 0;
    this.packScrollBar.setVisible(true);
    this.packScrollBar.height = barH;
    this.packScrollBar.y = this.PACK_VISIBLE_TOP + scrollFrac * travel;
  }

  private rebuildPackList(): void {
    this.packButtonContainer.removeAll(true);
    this.packScrollY = 0;
    this.packButtonContainer.y = this.PACK_VISIBLE_TOP;

    const gridW = this.PACK_COLS * this.PACK_CARD_W + (this.PACK_COLS - 1) * this.PACK_GAP;
    const gridOffsetX = Math.max(0, Math.floor((this.PACK_MASK_W - gridW) / 2));

    const catLabel = CATEGORIES.find((c) => c.minPlayers === this.selectedCategory)?.label ?? '';
    this.packHeaderText.setText(`PACKS — ${catLabel}`);

    const visiblePacks = ALL_PACKS.filter((p) => p.minPlayers === this.selectedCategory);

    if (visiblePacks.length === 0) {
      const empty = this.add.text(this.PACK_MASK_W / 2, 40, '(no packs for this category)', {
        ...FONT, fontSize: '10px', color: '#555555',
      }).setOrigin(0.5);
      this.packButtonContainer.add(empty);
      this.packContentHeight = 0;
      this.updatePackScrollBar();
      return;
    }

    visiblePacks.forEach((pack, i) => {
      const col = i % this.PACK_COLS;
      const row = Math.floor(i / this.PACK_COLS);
      const x = gridOffsetX + col * (this.PACK_CARD_W + this.PACK_GAP);
      const y = row * (this.PACK_CARD_H + this.PACK_GAP);
      const isSelected = pack.id === this.selectedPackId;

      const fill   = isSelected ? 0x1a3d2a : 0x1a1f2e;
      const hover  = 0x242b3d;
      const border = isSelected ? 0x00ff88 : 0x333355;

      const card = this.add.rectangle(x, y, this.PACK_CARD_W, this.PACK_CARD_H, fill)
        .setOrigin(0, 0)
        .setStrokeStyle(2, border)
        .setInteractive({ useHandCursor: true });

      const nameText = this.add.text(x + this.PACK_CARD_W / 2, y + 28, pack.name, {
        ...FONT, fontSize: '15px', color: isSelected ? '#00ff88' : '#dddddd',
      }).setOrigin(0.5);

      const info = `${pack.levels.length} levels • ${pack.minPlayers}+ players`;
      const infoText = this.add.text(x + this.PACK_CARD_W / 2, y + 58, info, {
        ...FONT, fontSize: '8px', color: isSelected ? '#77dd99' : '#777777',
      }).setOrigin(0.5);

      card.on('pointerover', (pointer: Phaser.Input.Pointer) => {
        if (!this.isPointerInPackArea(pointer)) return;
        if (!isSelected) {
          card.setFillStyle(hover);
          nameText.setColor('#ffffff');
        }
      });
      card.on('pointerout', () => {
        if (!isSelected) {
          card.setFillStyle(fill);
          nameText.setColor('#dddddd');
        }
      });
      card.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (!this.isPointerInPackArea(pointer)) return;
        if (!this.isHost) return;
        this.room.send('selectPack', { packId: pack.id });
      });

      this.packButtonContainer.add([card, nameText, infoText]);
    });

    const rows = Math.ceil(visiblePacks.length / this.PACK_COLS);
    this.packContentHeight = rows * this.PACK_CARD_H + Math.max(0, rows - 1) * this.PACK_GAP;
    this.updatePackScrollBar();
  }

  // ── Player list ───────────────────────────────────────────────────────────

  private rebuildPlayerList(): void {
    this.playerListContainer.removeAll(true);

    this.lobbyPlayers.forEach((player, index) => {
      const rowY = index * 28;
      const dotColor = PLAYER_COLORS[player.color] ?? 0xffffff;
      const dot = this.add.rectangle(6, rowY + 8, 16, 16, dotColor);
      const isMe = player.id === this.room.sessionId;
      const isHostPlayer = this.isHost && isMe;
      let label = isMe ? `${player.name} (you)` : player.name;
      if (isHostPlayer) label += ' [HOST]';
      const nameText = this.add.text(26, rowY + 8, label, {
        ...FONT, fontSize: '11px',
        color: isMe ? '#ffffff' : '#aaaaaa',
      }).setOrigin(0, 0.5);
      this.playerListContainer.add([dot, nameText]);
    });

    // Spectators section — tiny row under the player list.
    if (this.lobbySpectators.length > 0) {
      const baseY = this.lobbyPlayers.length * 28 + 8;
      const header = this.add.text(6, baseY, `WATCHING (${this.lobbySpectators.length})`, {
        ...FONT, fontSize: '9px', color: '#ff99ee',
      }).setOrigin(0, 0);
      this.playerListContainer.add(header);

      this.lobbySpectators.forEach((s, i) => {
        const rowY = baseY + 18 + i * 18;
        const isMe = s.id === this.room.sessionId;
        const label = isMe ? `${s.name} (you)` : s.name;
        const t = this.add.text(20, rowY, label, {
          ...FONT, fontSize: '9px', color: isMe ? '#ffffff' : '#888888',
        }).setOrigin(0, 0);
        this.playerListContainer.add(t);
      });
    }

    this.playerCountText.setText(`${this.lobbyPlayers.length} / 8 players`);
  }

  // ── Chat ──────────────────────────────────────────────────────────────────

  private addChatMessage(msg: ChatMessage): void {
    this.chatMessages.push(msg);
    if (this.chatMessages.length > MAX_CHAT) this.chatMessages.shift();
    this.rebuildChatLines();
  }

  private rebuildChatLines(): void {
    const chatW = this.cameras.main.width - this.SPLIT;
    this.chatLinesContainer.removeAll(true);
    const lineHeight = 32;
    this.chatMessages.forEach((msg, i) => {
      const text = this.add.text(0, i * lineHeight, `${msg.name}: ${msg.text}`, {
        ...FONT, fontSize: '11px', color: '#cccccc',
        wordWrap: { width: chatW - 48 },
      });
      this.chatLinesContainer.add(text);
    });
  }

  private handleKeydown(event: KeyboardEvent): void {
    const key = event.key;

    if (key === 'Enter') {
      const trimmed = this.typedMessage.trim();
      if (trimmed) {
        this.room.send('chat', { text: trimmed });
        this.typedMessage = '';
      }
    } else if (key === 'Backspace') {
      this.typedMessage = this.typedMessage.slice(0, -1);
    } else if (key.length === 1 && this.typedMessage.length < 60) {
      this.typedMessage += key;
    }

    this.chatInputText.setText(`> ${this.typedMessage}_`);
  }

  // ── Helper ────────────────────────────────────────────────────────────────

  private makeButton(
    x: number, y: number, label: string, color: string,
    onClick: () => void,
  ): void {
    const btn = this.add.text(x, y, label, {
      ...FONT, fontSize: '18px', color,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor(color));
    btn.on('pointerdown', onClick);
  }
}
