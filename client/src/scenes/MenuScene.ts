import Phaser from 'phaser';
import { Room } from 'colyseus.js';
import { ColyseusClient } from '../network/ColyseusClient';
import { loadStoredAccount, clearStoredAccount } from './AuthScene';

type MenuMode = 'main' | 'join' | 'spectate' | 'leaderboard' | 'connecting';
type ConnectAction = 'create' | 'quickplay' | 'join' | 'spectate';

const SERVER_URL =
  (import.meta.env.VITE_SERVER_URL as string | undefined) ?? 'ws://localhost:2567';
const HTTP_URL = SERVER_URL.replace(/^ws/, 'http');

const FONT = { fontFamily: '"Press Start 2P"' };

export class MenuScene extends Phaser.Scene {
  private network!: ColyseusClient;

  private mainGroup!: Phaser.GameObjects.Group;
  private joinGroup!: Phaser.GameObjects.Group;
  private spectateGroup!: Phaser.GameObjects.Group;
  private leaderboardGroup!: Phaser.GameObjects.Group;
  private connectingGroup!: Phaser.GameObjects.Group;

  private mode: MenuMode = 'main';
  private typedCode = '';
  private typedSpecCode = '';
  private codeDisplay!: Phaser.GameObjects.Text;
  private specCodeDisplay!: Phaser.GameObjects.Text;
  private joinBtn!: Phaser.GameObjects.Text;
  private specJoinBtn!: Phaser.GameObjects.Text;
  private errorText!: Phaser.GameObjects.Text;
  private specErrorText!: Phaser.GameObjects.Text;
  private connectingText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.network = new ColyseusClient();
    this.mode = 'main';
    this.typedCode = '';
    this.typedSpecCode = '';

    const cx = this.cameras.main.width  / 2;
    const cy = this.cameras.main.height / 2;

    // ── Main group ──────────────────────────────────────────────────────────
    const title = this.add.text(cx, cy - 210, 'PIKOPARK\nONLINE', {
      ...FONT, fontSize: '36px', color: '#ffffff', align: 'center',
      lineSpacing: 16,
    }).setOrigin(0.5);

    const createRoom = this.makeButton(cx, cy - 50, 'CREATE ROOM', '#00ff88', () => {
      this.startConnecting('create').catch(console.error);
    });

    const joinRoom = this.makeButton(cx, cy + 20, 'JOIN ROOM', '#00ccff', () => {
      this.showJoin();
    });

    const quickPlay = this.makeButton(cx, cy + 90, 'QUICK PLAY', '#ffff00', () => {
      this.startConnecting('quickplay').catch(console.error);
    });

    const spectate = this.makeButton(cx, cy + 160, 'SPECTATE', '#ff99ee', () => {
      this.showSpectate();
    });

    const leaderboard = this.makeButton(cx, cy + 220, 'LEADERBOARD', '#ffcc66', () => {
      this.showLeaderboard();
    });

    const hint = this.add.text(cx, cy + 260, 'quick play joins any open room', {
      ...FONT, fontSize: '10px', color: '#444444',
    }).setOrigin(0.5);

    // ── Account header (top-right) ─────────────────────────────────────────
    const acct = loadStoredAccount();
    const displayName = acct?.isGuest ? 'GUEST' : (acct?.username ?? 'GUEST');
    const accountLabel = this.add.text(
      this.cameras.main.width - 20, 20,
      `logged in as ${displayName}`,
      { ...FONT, fontSize: '10px', color: '#888888' },
    ).setOrigin(1, 0);
    const logoutBtn = this.add.text(
      this.cameras.main.width - 20, 44, 'LOG OUT',
      { ...FONT, fontSize: '10px', color: '#ff6666' },
    ).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    logoutBtn.on('pointerover', () => logoutBtn.setColor('#ffffff'));
    logoutBtn.on('pointerout', () => logoutBtn.setColor('#ff6666'));
    logoutBtn.on('pointerdown', () => {
      clearStoredAccount();
      this.scene.start('AuthScene');
    });

    this.mainGroup = this.add.group([title, createRoom, joinRoom, quickPlay, spectate, leaderboard, hint, accountLabel, logoutBtn]);

    // ── Join-by-code group ──────────────────────────────────────────────────
    const joinTitle = this.add.text(cx, cy - 140, 'ENTER CODE', {
      ...FONT, fontSize: '20px', color: '#aaaaaa',
    }).setOrigin(0.5);

    this.codeDisplay = this.add.text(cx, cy - 40, 'CODE: _ _ _ _', {
      ...FONT, fontSize: '26px', color: '#ffffff',
    }).setOrigin(0.5);

    this.joinBtn = this.makeButton(cx, cy + 60, 'JOIN', '#555555', () => {
      if (this.typedCode.length === 4) this.startConnecting('join').catch(console.error);
    });

    this.errorText = this.add.text(cx, cy + 130, '', {
      ...FONT, fontSize: '12px', color: '#ff4444',
    }).setOrigin(0.5);

    const cancelBtn = this.makeButton(cx, cy + 190, 'CANCEL', '#444444', () => {
      this.showMain();
    });

    this.joinGroup = this.add.group([joinTitle, this.codeDisplay, this.joinBtn, this.errorText, cancelBtn]);
    this.joinGroup.setVisible(false);

    // ── Spectate-by-code group ──────────────────────────────────────────────
    const specTitle = this.add.text(cx, cy - 140, 'SPECTATE ROOM', {
      ...FONT, fontSize: '20px', color: '#ff99ee',
    }).setOrigin(0.5);
    const specSub = this.add.text(cx, cy - 100, 'watch without taking a slot', {
      ...FONT, fontSize: '10px', color: '#666666',
    }).setOrigin(0.5);

    this.specCodeDisplay = this.add.text(cx, cy - 40, 'CODE: _ _ _ _', {
      ...FONT, fontSize: '26px', color: '#ffffff',
    }).setOrigin(0.5);

    this.specJoinBtn = this.makeButton(cx, cy + 60, 'WATCH', '#555555', () => {
      if (this.typedSpecCode.length === 4) this.startConnecting('spectate').catch(console.error);
    });

    this.specErrorText = this.add.text(cx, cy + 130, '', {
      ...FONT, fontSize: '12px', color: '#ff4444',
    }).setOrigin(0.5);

    const specCancelBtn = this.makeButton(cx, cy + 190, 'CANCEL', '#444444', () => {
      this.showMain();
    });

    this.spectateGroup = this.add.group([specTitle, specSub, this.specCodeDisplay, this.specJoinBtn, this.specErrorText, specCancelBtn]);
    this.spectateGroup.setVisible(false);

    // ── Leaderboard group (built dynamically when shown) ────────────────────
    this.leaderboardGroup = this.add.group([]);
    this.leaderboardGroup.setVisible(false);

    // ── Connecting group ────────────────────────────────────────────────────
    this.connectingText = this.add.text(cx, cy, 'Connecting...', {
      ...FONT, fontSize: '20px', color: '#ffff00',
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

  private hideAllGroups(): void {
    this.mainGroup.setVisible(false);
    this.joinGroup.setVisible(false);
    this.spectateGroup.setVisible(false);
    this.leaderboardGroup.setVisible(false);
    this.connectingGroup.setVisible(false);
  }

  private showMain(): void {
    this.mode = 'main';
    this.hideAllGroups();
    this.mainGroup.setVisible(true);
  }

  private showJoin(): void {
    this.mode = 'join';
    this.typedCode = '';
    this.errorText.setText('');
    this.updateCodeDisplay();
    this.hideAllGroups();
    this.joinGroup.setVisible(true);
  }

  private showSpectate(): void {
    this.mode = 'spectate';
    this.typedSpecCode = '';
    this.specErrorText.setText('');
    this.updateSpecCodeDisplay();
    this.hideAllGroups();
    this.spectateGroup.setVisible(true);
  }

  private showLeaderboard(): void {
    this.mode = 'leaderboard';
    this.hideAllGroups();
    this.leaderboardGroup.setVisible(true);
    this.renderLeaderboard().catch((err) => console.error('[MenuScene] leaderboard fetch failed:', err));
  }

  private async startConnecting(action: ConnectAction): Promise<void> {
    this.mode = 'connecting';
    this.hideAllGroups();
    this.connectingGroup.setVisible(true);

    const isSpectator = action === 'spectate';
    const acct = loadStoredAccount();
    const hasName = acct !== null && !acct.isGuest && acct.username.length > 0;
    const playerName = hasName
      ? acct.username
      : isSpectator
        ? `Spectator ${Math.floor(Math.random() * 100)}`
        : `Player ${Math.floor(Math.random() * 100)}`;
    const joinOptions: Record<string, unknown> = { name: playerName };
    if (isSpectator) joinOptions['spectator'] = true;

    try {
      let room: Room;

      if (action === 'create') {
        this.connectingText.setText('Creating room...');
        room = await this.network.create('game_room', joinOptions);
      } else if (action === 'quickplay') {
        this.connectingText.setText('Finding room...');
        room = await this.network.joinOrCreate('game_room', joinOptions);
      } else if (action === 'spectate') {
        this.connectingText.setText(`Spectating ${this.typedSpecCode}...`);
        const roomId = await this.network.findRoomByCode('game_room', this.typedSpecCode);
        if (!roomId) {
          const failedCode = this.typedSpecCode;
          this.showSpectate();
          this.typedSpecCode = failedCode;
          this.updateSpecCodeDisplay();
          this.specErrorText.setText(`"${failedCode}" not found`);
          return;
        }
        room = await this.network.joinById(roomId, joinOptions);
      } else {
        this.connectingText.setText(`Joining ${this.typedCode}...`);
        const roomId = await this.network.findRoomByCode('game_room', this.typedCode);
        if (!roomId) {
          const failedCode = this.typedCode;
          this.showJoin();
          this.typedCode = failedCode;
          this.updateCodeDisplay();
          this.errorText.setText(`"${failedCode}" not found`);
          return;
        }
        room = await this.network.joinById(roomId, joinOptions);
      }

      this.scene.start('LobbyScene', { room, network: this.network, isSpectator });
    } catch (err: unknown) {
      console.error('[MenuScene] Connection failed:', err);
      this.showMain();
    }
  }

  // ─── Keyboard capture ──────────────────────────────────────────────────────

  private handleKeydown(event: KeyboardEvent): void {
    if (this.mode === 'join') {
      const key = event.key.toUpperCase();
      if (key === 'BACKSPACE') {
        this.typedCode = this.typedCode.slice(0, -1);
      } else if (key === 'ENTER' && this.typedCode.length === 4) {
        this.startConnecting('join').catch(console.error);
      } else if (/^[A-Z]$/.test(key) && this.typedCode.length < 4) {
        this.typedCode += key;
      }
      this.updateCodeDisplay();
    } else if (this.mode === 'spectate') {
      const key = event.key.toUpperCase();
      if (key === 'BACKSPACE') {
        this.typedSpecCode = this.typedSpecCode.slice(0, -1);
      } else if (key === 'ENTER' && this.typedSpecCode.length === 4) {
        this.startConnecting('spectate').catch(console.error);
      } else if (/^[A-Z]$/.test(key) && this.typedSpecCode.length < 4) {
        this.typedSpecCode += key;
      }
      this.updateSpecCodeDisplay();
    } else if (this.mode === 'leaderboard') {
      if (event.key === 'Escape') this.showMain();
    }
  }

  private updateCodeDisplay(): void {
    const slots = (this.typedCode + '    ').slice(0, 4).split('').join(' ');
    this.codeDisplay.setText(`CODE: ${slots}`);
    this.joinBtn.setColor(this.typedCode.length === 4 ? '#00ff88' : '#555555');
  }

  private updateSpecCodeDisplay(): void {
    const slots = (this.typedSpecCode + '    ').slice(0, 4).split('').join(' ');
    this.specCodeDisplay.setText(`CODE: ${slots}`);
    this.specJoinBtn.setColor(this.typedSpecCode.length === 4 ? '#ff99ee' : '#555555');
  }

  // ─── Leaderboard panel ─────────────────────────────────────────────────────

  private async renderLeaderboard(): Promise<void> {
    this.leaderboardGroup.clear(true, true);
    const cx = this.cameras.main.width / 2;

    const title = this.add.text(cx, 40, 'LEADERBOARD', {
      ...FONT, fontSize: '28px', color: '#ffcc66',
    }).setOrigin(0.5);
    const loading = this.add.text(cx, 100, 'loading...', {
      ...FONT, fontSize: '12px', color: '#888888',
    }).setOrigin(0.5);
    const back = this.makeButton(cx, this.cameras.main.height - 40, 'BACK', '#888888', () => this.showMain());
    this.leaderboardGroup.addMultiple([title, loading, back]);

    try {
      const res = await fetch(`${HTTP_URL}/leaderboard`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { levels: Record<string, Array<{ timeMs: number; players: string[]; completedAt: string }>> };
      loading.destroy();

      const levelIds = Object.keys(data.levels).map(Number).sort((a, b) => a - b);
      if (levelIds.length === 0) {
        const empty = this.add.text(cx, 220, 'no records yet — be the first!', {
          ...FONT, fontSize: '12px', color: '#666666',
        }).setOrigin(0.5);
        this.leaderboardGroup.add(empty);
        return;
      }

      // Scrollable list: one column, each level header + top 3 times.
      const listContainer = this.add.container(0, 0);
      this.leaderboardGroup.add(listContainer);

      const maskTop = 80;
      const maskH = this.cameras.main.height - 160;
      const maskW = 600;
      const maskX = cx - maskW / 2;
      const maskShape = this.make.graphics({}, false);
      maskShape.fillStyle(0xffffff);
      maskShape.fillRect(maskX, maskTop, maskW, maskH);
      listContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, maskShape));

      let y = maskTop;
      for (const id of levelIds) {
        const header = this.add.text(cx, y, `LEVEL ${id}`, {
          ...FONT, fontSize: '14px', color: '#ffcc66',
        }).setOrigin(0.5);
        listContainer.add(header);
        y += 24;

        const top = data.levels[String(id)] ?? [];
        top.slice(0, 3).forEach((entry, i) => {
          const timeStr = this.formatTime(entry.timeMs);
          const names = entry.players.slice(0, 2).join(', ') || '(anon)';
          const medal = ['1st', '2nd', '3rd'][i] ?? `${i + 1}th`;
          const row = this.add.text(cx, y, `${medal}  ${timeStr}  —  ${names}`, {
            ...FONT, fontSize: '10px', color: i === 0 ? '#ffffff' : '#bbbbbb',
          }).setOrigin(0.5);
          listContainer.add(row);
          y += 18;
        });
        y += 10;
      }

      // Scroll with mouse wheel
      const contentHeight = y - maskTop;
      const maxScroll = Math.max(0, contentHeight - maskH);
      let scrollY = 0;
      this.input.on('wheel', (_p: unknown, _g: unknown, _dx: number, dy: number) => {
        if (this.mode !== 'leaderboard') return;
        scrollY = Phaser.Math.Clamp(scrollY + dy * 0.5, 0, maxScroll);
        listContainer.y = -scrollY;
      });
    } catch (err: unknown) {
      console.warn('[MenuScene] leaderboard fetch failed:', err);
      loading.setText('server unreachable').setColor('#ff4444');
    }
  }

  private formatTime(ms: number): string {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const cs = Math.floor((ms % 1000) / 10);
    return `${mins}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  }

  // ─── Helper ────────────────────────────────────────────────────────────────

  private makeButton(
    x: number, y: number, label: string, color: string,
    onClick: () => void,
  ): Phaser.GameObjects.Text {
    const btn = this.add.text(x, y, label, {
      ...FONT, fontSize: '20px', color,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor(color));
    btn.on('pointerdown', onClick);
    return btn;
  }
}
