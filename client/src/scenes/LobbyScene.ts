import Phaser from 'phaser';
import { Room } from 'colyseus.js';
import { ColyseusClient } from '../network/ColyseusClient';
import { PLAYER_COLORS, ALL_PACKS } from '@pikopark/shared';

interface LobbyData {
  room: Room;
  network: ColyseusClient;
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

const FONT = { fontFamily: '"Press Start 2P"' };
const MAX_CHAT = 14;

export class LobbyScene extends Phaser.Scene {
  private room!: Room;
  private network!: ColyseusClient;

  // ── Left panel ────────────────────────────────────────────────────────────
  private roomCodeText!: Phaser.GameObjects.Text;

  // ── Pack selection ────────────────────────────────────────────────────────
  private packButtons: Phaser.GameObjects.Text[] = [];
  private packInfoText!: Phaser.GameObjects.Text;
  private packErrorText!: Phaser.GameObjects.Text;
  private selectedPackId = 'basics';
  private playerListContainer!: Phaser.GameObjects.Container;
  private playerCountText!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Text;

  // ── Player roster from server ─────────────────────────────────────────────
  private lobbyPlayers: LobbyPlayer[] = [];
  private isHost = false;

  // ── Right panel — chat ────────────────────────────────────────────────────
  private chatMessages: ChatMessage[] = [];
  private typedMessage = '';
  private chatInputText!: Phaser.GameObjects.Text;
  private chatLinesContainer!: Phaser.GameObjects.Container;

  // Layout constants (computed in create from actual canvas size)
  private SPLIT = 0;   // x where left panel ends / right panel begins

  constructor() {
    super({ key: 'LobbyScene' });
  }

  init(data: LobbyData): void {
    this.room = data.room;
    this.network = data.network;
  }

  create(): void {
    const W = this.cameras.main.width;   // 1280
    const H = this.cameras.main.height;  // 720

    this.SPLIT = Math.round(W * 0.38);   // ~486px left panel, ~794px chat
    const lx = this.SPLIT / 2;
    const rx = this.SPLIT + (W - this.SPLIT) / 2;
    const chatW = W - this.SPLIT;

    // ── Background panels ─────────────────────────────────────────────────────
    this.add.rectangle(lx, H / 2, this.SPLIT, H, 0x111122);
    this.add.rectangle(rx, H / 2, chatW, H, 0x0d1117);
    this.add.rectangle(this.SPLIT, H / 2, 2, H, 0x333355); // divider

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

    // ── Pack selector ─────────────────────────────────────────────────────────
    this.add.rectangle(lx, H - 310, this.SPLIT - 40, 2, 0x333355);
    this.add.text(lx, H - 292, 'PACK', {
      ...FONT, fontSize: '11px', color: '#888888',
    }).setOrigin(0.5);

    ALL_PACKS.forEach((pack: typeof ALL_PACKS[number], i: number) => {
      const btnY = H - 258 + i * 42;
      const btn = this.add.text(lx, btnY, `${pack.name}  (${pack.minPlayers}p+)`, {
        ...FONT, fontSize: '11px', color: '#555555',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerover', () => { if (pack.id !== this.selectedPackId) btn.setColor('#aaaaaa'); });
      btn.on('pointerout',  () => { if (pack.id !== this.selectedPackId) btn.setColor('#555555'); });
      btn.on('pointerdown', () => {
        if (!this.isHost) return;
        this.room.send('selectPack', { packId: pack.id });
      });
      this.packButtons.push(btn);
    });

    this.packInfoText = this.add.text(lx, H - 134, '', {
      ...FONT, fontSize: '10px', color: '#888888',
    }).setOrigin(0.5);

    this.packErrorText = this.add.text(lx, H - 116, '', {
      ...FONT, fontSize: '9px', color: '#ff4444',
    }).setOrigin(0.5);

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

    // ── Right panel: chat ─────────────────────────────────────────────────────
    this.add.text(rx, 36, 'CHAT', {
      ...FONT, fontSize: '22px', color: '#aaaaaa',
    }).setOrigin(0.5);

    this.add.rectangle(rx, 62, chatW - 40, 2, 0x333355);

    this.chatLinesContainer = this.add.container(this.SPLIT + 20, 74);

    this.add.rectangle(rx, H - 64, chatW - 40, 2, 0x333355);
    this.chatInputText = this.add.text(this.SPLIT + 20, H - 52, '> _', {
      ...FONT, fontSize: '14px', color: '#00ccff',
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

    this.room.onMessage('playerList', (data: { players: LobbyPlayer[]; hostId: string }) => {
      if (!this.scene.isActive('LobbyScene')) return;
      this.lobbyPlayers = data.players;
      this.isHost = data.hostId === this.room.sessionId;
      this.startButton.setVisible(this.isHost);
      this.rebuildPlayerList();
    });

    this.room.onMessage('gameStart', () => {
      this.scene.start('GameScene', { room: this.room, network: this.network });
    });

    this.room.onMessage('packSelected', (data: { packId: string; name: string; minPlayers: number }) => {
      this.selectedPackId = data.packId;
      this.packInfoText.setText(`${data.name} — min ${data.minPlayers} players`);
      this.packErrorText.setText('');
      this.packButtons.forEach((btn, i) => {
        const pack = ALL_PACKS[i];
        btn.setColor(pack?.id === data.packId ? '#00ff88' : '#555555');
      });
    });

    this.room.onMessage('startError', (data: { message: string }) => {
      this.packErrorText.setText(data.message);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cur = this.room.state as any;
    if (cur?.roomCode) {
      this.roomCodeText.setText(`CODE: ${String(cur.roomCode)}`);
    }
  }

  // ── Player list ───────────────────────────────────────────────────────────

  private rebuildPlayerList(): void {
    this.playerListContainer.removeAll(true);

    this.lobbyPlayers.forEach((player, index) => {
      const rowY = index * 56;
      const dotColor = PLAYER_COLORS[player.color] ?? 0xffffff;
      const dot = this.add.rectangle(6, rowY + 8, 18, 18, dotColor);
      const isMe = player.id === this.room.sessionId;
      const isHostPlayer = this.isHost && isMe;
      let label = isMe ? `${player.name} (you)` : player.name;
      if (isHostPlayer) label += ' [HOST]';
      const nameText = this.add.text(28, rowY + 8, label, {
        ...FONT, fontSize: '13px',
        color: isMe ? '#ffffff' : '#aaaaaa',
      }).setOrigin(0, 0.5);
      this.playerListContainer.add([dot, nameText]);
    });

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
    const lineHeight = 36;
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
