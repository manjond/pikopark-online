import Phaser from 'phaser';
import { Room } from 'colyseus.js';
import { ColyseusClient } from '../network/ColyseusClient';

type MenuMode = 'main' | 'join' | 'connecting';
type ConnectAction = 'create' | 'quickplay' | 'join';

const FONT = { fontFamily: '"Press Start 2P"' };

export class MenuScene extends Phaser.Scene {
  private network!: ColyseusClient;

  private mainGroup!: Phaser.GameObjects.Group;
  private joinGroup!: Phaser.GameObjects.Group;
  private connectingGroup!: Phaser.GameObjects.Group;

  private mode: MenuMode = 'main';
  private typedCode = '';
  private codeDisplay!: Phaser.GameObjects.Text;
  private joinBtn!: Phaser.GameObjects.Text;
  private errorText!: Phaser.GameObjects.Text;
  private connectingText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.network = new ColyseusClient();
    this.mode = 'main';
    this.typedCode = '';

    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;

    // ── Main group ──────────────────────────────────────────────────────────
    const title = this.add.text(cx, cy - 80, 'PIKOPARK\nONLINE', {
      ...FONT, fontSize: '12px', color: '#ffffff', align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5);

    const createRoom = this.makeButton(cx, cy - 20, 'CREATE ROOM', '#00ff88', () => {
      this.startConnecting('create').catch(console.error);
    });

    const joinRoom = this.makeButton(cx, cy + 4, 'JOIN ROOM', '#00ccff', () => {
      this.showJoin();
    });

    const quickPlay = this.makeButton(cx, cy + 28, 'QUICK PLAY', '#ffff00', () => {
      this.startConnecting('quickplay').catch(console.error);
    });

    const hint = this.add.text(cx, cy + 44, 'quick play joins any open room', {
      ...FONT, fontSize: '5px', color: '#444444',
    }).setOrigin(0.5);

    this.mainGroup = this.add.group([title, createRoom, joinRoom, quickPlay, hint]);

    // ── Join-by-code group ──────────────────────────────────────────────────
    const joinTitle = this.add.text(cx, cy - 60, 'ENTER CODE', {
      ...FONT, fontSize: '8px', color: '#aaaaaa',
    }).setOrigin(0.5);

    this.codeDisplay = this.add.text(cx, cy - 28, 'CODE: _ _ _ _', {
      ...FONT, fontSize: '10px', color: '#ffffff',
    }).setOrigin(0.5);

    this.joinBtn = this.makeButton(cx, cy + 10, 'JOIN', '#555555', () => {
      if (this.typedCode.length === 4) this.startConnecting('join').catch(console.error);
    });

    this.errorText = this.add.text(cx, cy + 36, '', {
      ...FONT, fontSize: '6px', color: '#ff4444',
    }).setOrigin(0.5);

    const cancelBtn = this.makeButton(cx, cy + 56, 'CANCEL', '#444444', () => {
      this.showMain();
    });

    this.joinGroup = this.add.group([joinTitle, this.codeDisplay, this.joinBtn, this.errorText, cancelBtn]);
    this.joinGroup.setVisible(false);

    // ── Connecting group ────────────────────────────────────────────────────
    this.connectingText = this.add.text(cx, cy, 'Connecting...', {
      ...FONT, fontSize: '8px', color: '#ffff00',
    }).setOrigin(0.5);

    this.connectingGroup = this.add.group([this.connectingText]);
    this.connectingGroup.setVisible(false);

    // ── Keyboard capture ────────────────────────────────────────────────────
    this.input.keyboard!.on('keydown', this.handleKeydown, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard!.off('keydown', this.handleKeydown, this);
    });
  }

  // ─── Mode transitions ──────────────────────────────────────────────────────

  private showMain(): void {
    this.mode = 'main';
    this.mainGroup.setVisible(true);
    this.joinGroup.setVisible(false);
    this.connectingGroup.setVisible(false);
  }

  private showJoin(): void {
    this.mode = 'join';
    this.typedCode = '';
    this.errorText.setText('');
    this.updateCodeDisplay();
    this.mainGroup.setVisible(false);
    this.joinGroup.setVisible(true);
    this.connectingGroup.setVisible(false);
  }

  private async startConnecting(action: ConnectAction): Promise<void> {
    this.mode = 'connecting';
    this.mainGroup.setVisible(false);
    this.joinGroup.setVisible(false);
    this.connectingGroup.setVisible(true);

    const playerName = `Player ${Math.floor(Math.random() * 100)}`;

    try {
      let room: Room;

      if (action === 'create') {
        this.connectingText.setText('Creating room...');
        room = await this.network.create('game_room', { name: playerName });
      } else if (action === 'quickplay') {
        this.connectingText.setText('Finding room...');
        room = await this.network.joinOrCreate('game_room', { name: playerName });
      } else {
        this.connectingText.setText(`Joining ${this.typedCode}...`);
        const roomId = await this.network.findRoomByCode('game_room', this.typedCode);
        if (!roomId) {
          this.showJoin();
          this.errorText.setText(`"${this.typedCode}" not found`);
          return;
        }
        room = await this.network.joinById(roomId, { name: playerName });
      }

      this.scene.start('LobbyScene', { room, network: this.network });
    } catch (err: unknown) {
      console.error('[MenuScene] Connection failed:', err);
      this.showMain();
    }
  }

  // ─── Keyboard capture ──────────────────────────────────────────────────────

  private handleKeydown(event: KeyboardEvent): void {
    if (this.mode !== 'join') return;

    const key = event.key.toUpperCase();
    if (key === 'BACKSPACE') {
      this.typedCode = this.typedCode.slice(0, -1);
    } else if (key === 'ENTER' && this.typedCode.length === 4) {
      this.startConnecting('join').catch(console.error);
    } else if (/^[A-Z]$/.test(key) && this.typedCode.length < 4) {
      this.typedCode += key;
    }
    this.updateCodeDisplay();
  }

  private updateCodeDisplay(): void {
    const slots = (this.typedCode + '    ').slice(0, 4).split('').join(' ');
    this.codeDisplay.setText(`CODE: ${slots}`);
    this.joinBtn.setColor(this.typedCode.length === 4 ? '#00ff88' : '#555555');
  }

  // ─── Helper ────────────────────────────────────────────────────────────────

  private makeButton(
    x: number, y: number, label: string, color: string,
    onClick: () => void,
  ): Phaser.GameObjects.Text {
    const btn = this.add.text(x, y, label, {
      ...FONT, fontSize: '8px', color,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor(color));
    btn.on('pointerdown', onClick);
    return btn;
  }
}
