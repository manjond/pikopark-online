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
    const W = this.cameras.main.width;   // 480
    const H = this.cameras.main.height;  // 270

    // ── Background panels ─────────────────────────────────────────────────────
    // Left half
    this.add.rectangle(W / 4, H / 2, W / 2 - 2, H, 0x111122, 0.6);
    // Right half
    this.add.rectangle(W * 3 / 4, H / 2, W / 2 - 2, H, 0x0d1117, 0.7);

    // ── Left panel: room info + player list ───────────────────────────────────
    const lx = W / 4;  // centre of left panel = 120

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

    this.add.rectangle(lx, 70, 220, 1, 0x333355);

    this.playerListContainer = this.add.container(lx, 80);

    this.makeButton(lx, H - 36, 'START GAME', '#00ff00', () => {
      this.scene.start('GameScene', { room: this.room, network: this.network });
    });
    this.makeButton(lx, H - 18, 'LEAVE', '#666666', () => {
      void this.room.leave();
      this.scene.start('MenuScene');
    });

    // ── Right panel: chat ─────────────────────────────────────────────────────
    const rx = W * 3 / 4;  // centre of right panel = 360

    this.add.text(rx, 14, 'CHAT', {
      ...FONT, fontSize: '8px', color: '#aaaaaa',
    }).setOrigin(0.5);

    this.add.rectangle(rx, 22, W / 2 - 8, 1, 0x333355);

    // Chat messages container (scrolls newest at bottom)
    this.chatLinesContainer = this.add.container(W / 2 + 4, 28);

    // Input divider + input box
    this.add.rectangle(rx, H - 28, W / 2 - 8, 1, 0x333355);
    this.chatInputText = this.add.text(W / 2 + 4, H - 22, '> _', {
      ...FONT, fontSize: '6px', color: '#00ccff',
      wordWrap: { width: W / 2 - 12 },
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

    // Poll for initial state (roomCode + player list)
    const tryApplyState = () => {
      const state = this.room.state as NetworkGameState;
      if (!state?.roomCode) {
        this.time.delayedCall(100, tryApplyState);
        return;
      }
      this.roomCodeText.setText(`CODE: ${state.roomCode}`);
      this.subscribeToPlayers(state);
    };
    this.time.delayedCall(0, tryApplyState);
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
      const dot = this.add.rectangle(-90, rowY, 7, 7, dotColor);
      const isMe = player.id === this.room.sessionId;
      const label = isMe ? `${player.name} (you)` : player.name;
      const nameText = this.add.text(-78, rowY, label, {
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

    const lineHeight = 17;
    this.chatMessages.forEach((msg, i) => {
      const text = this.add.text(0, i * lineHeight, `${msg.name}: ${msg.text}`, {
        ...FONT, fontSize: '6px', color: '#cccccc',
        wordWrap: { width: this.cameras.main.width / 2 - 12 },
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
