import Phaser from 'phaser';
import { Room } from 'colyseus.js';
import { ColyseusClient, NetworkGameState, NetworkPlayer } from '../network/ColyseusClient';
import { PLAYER_COLORS } from '@pikopark/shared';

interface LobbyData {
  room: Room;
  network: ColyseusClient;
}

interface ChatMessage {
  name: string;
  text: string;
}

const FONT = { fontFamily: '"Press Start 2P"' };
const MAX_CHAT = 8;
const CHAT_W = 160;   // right-panel chat width (1/3 of 480)
const LOBBY_W = 320;  // left-panel lobby width (2/3 of 480)

export class LobbyScene extends Phaser.Scene {
  private room!: Room;
  private network!: ColyseusClient;

  // ── Left panel ────────────────────────────────────────────────────────────
  private roomCodeText!: Phaser.GameObjects.Text;
  private playerListContainer!: Phaser.GameObjects.Container;
  private playerCountText!: Phaser.GameObjects.Text;

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

    // lx = centre of left lobby panel (2/3 of screen)
    // rx = centre of right chat panel (1/3 of screen)
    const lx = LOBBY_W / 2;           // 160
    const rx = LOBBY_W + CHAT_W / 2;  // 400

    // ── Background panels ─────────────────────────────────────────────────────
    this.add.rectangle(lx, H / 2, LOBBY_W - 2, H, 0x111122, 0.6);
    this.add.rectangle(rx, H / 2, CHAT_W - 2, H, 0x0d1117, 0.7);

    // ── Left panel: room info + player list ───────────────────────────────────
    this.add.text(lx, 14, 'LOBBY', {
      ...FONT, fontSize: '12px', color: '#ffffff',
    }).setOrigin(0.5);

    this.roomCodeText = this.add.text(lx, 34, 'CODE: ....', {
      ...FONT, fontSize: '8px', color: '#00ff88',
    }).setOrigin(0.5);

    this.add.text(lx, 48, 'share with friends', {
      ...FONT, fontSize: '5px', color: '#444466',
    }).setOrigin(0.5);

    this.playerCountText = this.add.text(lx, 60, '', {
      ...FONT, fontSize: '6px', color: '#888888',
    }).setOrigin(0.5);

    this.add.rectangle(lx, 70, LOBBY_W - 20, 1, 0x333355);

    // Container anchored to absolute left — dot + name are relative to (0,0)
    this.playerListContainer = this.add.container(8, 80);

    this.makeButton(lx, H - 36, 'START GAME', '#00ff00', () => {
      this.scene.start('GameScene', { room: this.room, network: this.network });
    });
    this.makeButton(lx, H - 18, 'LEAVE', '#666666', () => {
      void this.room.leave();
      this.scene.start('MenuScene');
    });

    // ── Right panel: chat ─────────────────────────────────────────────────────
    this.add.text(rx, 14, 'CHAT', {
      ...FONT, fontSize: '7px', color: '#aaaaaa',
    }).setOrigin(0.5);

    this.add.rectangle(rx, 22, CHAT_W - 8, 1, 0x333355);

    // Chat messages container (scrolls newest at bottom)
    this.chatLinesContainer = this.add.container(LOBBY_W + 4, 28);

    // Input divider + input box
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

    // ── Room state ─────────────────────────────────────────────────────────────
    // Listen for incoming chat messages
    this.room.onMessage('chat', (data: { name: string; text: string }) => {
      this.addChatMessage(data);
    });

    // Room code: server sends it explicitly via onJoin (arrives after ROOM_STATE).
    // This is the most reliable approach — no state-sync timing issues.
    this.room.onMessage('roomCode', (data: { code: string }) => {
      this.roomCodeText.setText(`CODE: ${data.code}`);
    });

    // Fallback: state may already be synced (e.g. low-latency local dev)
    const cur = this.room.state as NetworkGameState;
    if (cur?.roomCode) {
      this.roomCodeText.setText(`CODE: ${cur.roomCode}`);
    }

    // Player list — subscribe immediately; onAdd fires for each player as state arrives
    this.subscribeToPlayers(this.room.state as NetworkGameState);
  }

  // ── Player list ───────────────────────────────────────────────────────────

  private subscribeToPlayers(state: NetworkGameState): void {
    this.rebuildPlayerList(state);
    state.players.onAdd((_player: NetworkPlayer, _sessionId: string) => {
      this.rebuildPlayerList(state);
    });
    state.players.onRemove((_player: NetworkPlayer, _sessionId: string) => {
      this.rebuildPlayerList(state);
    });
  }

  private rebuildPlayerList(state: NetworkGameState): void {
    this.playerListContainer.removeAll(true);

    let index = 0;
    state.players.forEach((player: NetworkPlayer) => {
      const rowY = index * 16;
      const dotColor = PLAYER_COLORS[player.color] ?? 0xffffff;
      const dot = this.add.rectangle(4, rowY, 7, 7, dotColor);
      const isMe = player.id === this.room.sessionId;
      const label = isMe ? `${player.name} (you)` : player.name;
      const nameText = this.add.text(14, rowY, label, {
        ...FONT, fontSize: '7px',
        color: isMe ? '#ffffff' : '#aaaaaa',
      }).setOrigin(0, 0.5);
      this.playerListContainer.add([dot, nameText]);
      index++;
    });

    this.playerCountText.setText(`${index} / 8 players`);
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
