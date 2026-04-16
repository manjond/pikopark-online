import Phaser from 'phaser';
import { Room } from 'colyseus.js';
import { ColyseusClient } from '../network/ColyseusClient';
import { PLAYER_COLORS } from '@pikopark/shared';

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
const MAX_CHAT = 8;
// Full-width layout: left 2/3 = players, right 1/3 = chat
const CHAT_W = 160;
const LOBBY_W = 320;

export class LobbyScene extends Phaser.Scene {
  private room!: Room;
  private network!: ColyseusClient;

  // ── Left panel ────────────────────────────────────────────────────────────
  private roomCodeText!: Phaser.GameObjects.Text;
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

  constructor() {
    super({ key: 'LobbyScene' });
  }

  init(data: LobbyData): void {
    this.room = data.room;
    this.network = data.network;
  }

  create(): void {
    const H = this.cameras.main.height;  // 270

    const lx = LOBBY_W / 2;           // 160  (center of left lobby panel)
    const rx = LOBBY_W + CHAT_W / 2;  // 400  (center of right chat panel)

    // ── Background panels ─────────────────────────────────────────────────────
    this.add.rectangle(lx, H / 2, LOBBY_W - 2, H, 0x111122, 0.6);
    this.add.rectangle(rx, H / 2, CHAT_W - 2, H, 0x0d1117, 0.7);

    // ── Left panel: room info ─────────────────────────────────────────────────
    this.add.text(lx, 12, 'LOBBY', {
      ...FONT, fontSize: '12px', color: '#ffffff',
    }).setOrigin(0.5);

    this.roomCodeText = this.add.text(lx, 30, 'CODE: ....', {
      ...FONT, fontSize: '8px', color: '#00ff88',
    }).setOrigin(0.5);

    this.add.text(lx, 42, 'share with friends', {
      ...FONT, fontSize: '5px', color: '#444466',
    }).setOrigin(0.5);

    this.playerCountText = this.add.text(lx, 54, '0 / 8 players', {
      ...FONT, fontSize: '6px', color: '#888888',
    }).setOrigin(0.5);

    this.add.rectangle(lx, 63, LOBBY_W - 20, 1, 0x333355);

    // ── Player list (upper 60% of left panel) ─────────────────────────────────
    // Container anchored so each row is relative to (8, 68)
    this.playerListContainer = this.add.container(8, 68);

    // ── Divider above buttons ─────────────────────────────────────────────────
    this.add.rectangle(lx, H - 52, LOBBY_W - 20, 1, 0x333355);

    // ── START GAME — visible only to host ─────────────────────────────────────
    this.startButton = this.add.text(lx, H - 38, 'START GAME', {
      ...FONT, fontSize: '8px', color: '#00ff00',
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);   // hidden until host status confirmed

    this.startButton.on('pointerover', () => this.startButton.setColor('#ffffff'));
    this.startButton.on('pointerout', () => this.startButton.setColor('#00ff00'));
    this.startButton.on('pointerdown', () => {
      this.room.send('startGame', {});
    });

    this.makeButton(lx, H - 18, 'LEAVE', '#666666', () => {
      void this.room.leave();
      this.scene.start('MenuScene');
    });

    // ── Right panel: chat ─────────────────────────────────────────────────────
    this.add.text(rx, 12, 'CHAT', {
      ...FONT, fontSize: '7px', color: '#aaaaaa',
    }).setOrigin(0.5);

    this.add.rectangle(rx, 20, CHAT_W - 8, 1, 0x333355);

    this.chatLinesContainer = this.add.container(LOBBY_W + 4, 26);

    this.add.rectangle(rx, H - 28, CHAT_W - 8, 1, 0x333355);
    this.chatInputText = this.add.text(LOBBY_W + 4, H - 22, '> _', {
      ...FONT, fontSize: '6px', color: '#00ccff',
      wordWrap: { width: CHAT_W - 16 },
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

    // Room code sent explicitly by server after ROOM_STATE is ready.
    this.room.onMessage('roomCode', (data: { code: string }) => {
      this.roomCodeText.setText(`CODE: ${data.code}`);
    });

    // playerList replaces the broken state.players.forEach approach.
    // Server broadcasts this on every join/leave and after gameStart.
    this.room.onMessage('playerList', (data: { players: LobbyPlayer[]; hostId: string }) => {
      if (!this.scene.isActive('LobbyScene')) return;
      this.lobbyPlayers = data.players;
      this.isHost = data.hostId === this.room.sessionId;
      this.startButton.setVisible(this.isHost);
      this.rebuildPlayerList();
    });

    // Server broadcasts 'gameStart' when the host sends 'startGame'.
    this.room.onMessage('gameStart', () => {
      this.scene.start('GameScene', { room: this.room, network: this.network });
    });

    // Seed room code from state if already available (fast / local dev).
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
      const rowY = index * 18;
      const dotColor = PLAYER_COLORS[player.color] ?? 0xffffff;
      const dot = this.add.rectangle(4, rowY + 4, 8, 8, dotColor);
      const isMe = player.id === this.room.sessionId;
      const isHostPlayer = this.isHost && isMe;
      let label = isMe ? `${player.name} (you)` : player.name;
      if (isHostPlayer) label += ' [HOST]';
      const nameText = this.add.text(16, rowY + 4, label, {
        ...FONT, fontSize: '6px',
        color: isMe ? '#ffffff' : '#aaaaaa',
      }).setOrigin(0, 0.5);
      this.playerListContainer.add([dot, nameText]);
    });

    this.playerCountText.setText(`${this.lobbyPlayers.length} / 8 players`);
  }

  // ── Chat ──────────────────────────────────────────────────────────────────

  private addChatMessage(msg: ChatMessage): void {
    this.chatMessages.push(msg);
    if (this.chatMessages.length > MAX_CHAT) {
      this.chatMessages.shift();
    }
    this.rebuildChatLines();
  }

  private rebuildChatLines(): void {
    this.chatLinesContainer.removeAll(true);

    const lineHeight = 16;
    this.chatMessages.forEach((msg, i) => {
      const text = this.add.text(0, i * lineHeight, `${msg.name}: ${msg.text}`, {
        ...FONT, fontSize: '6px', color: '#cccccc',
        wordWrap: { width: CHAT_W - 16 },
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
    } else if (key.length === 1 && this.typedMessage.length < 40) {
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
      ...FONT, fontSize: '8px', color,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor(color));
    btn.on('pointerdown', onClick);
  }
}
