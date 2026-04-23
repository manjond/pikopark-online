import Phaser from 'phaser';

const SERVER_URL =
  (import.meta.env.VITE_SERVER_URL as string | undefined) ?? 'ws://localhost:2567';
const HTTP_URL = SERVER_URL.replace(/^ws/, 'http');

const FONT = { fontFamily: '"Press Start 2P"' };

/** localStorage key where the currently-logged-in identity is cached. */
export const ACCOUNT_STORAGE_KEY = 'pikopark_account';

export interface StoredAccount {
  username: string;
  isGuest: boolean;
}

type AuthMode = 'main' | 'register' | 'login' | 'busy';
type Field = 'username' | 'password';

/**
 * First screen after Boot. Offers Create Account / Log In / Play as Guest.
 *
 * Once chosen, the identity is cached in localStorage so returning visitors
 * skip this scene automatically. The "Log out" button in MenuScene clears
 * the cache and sends them back here.
 */
export class AuthScene extends Phaser.Scene {
  private mode: AuthMode = 'main';
  private formMode: 'register' | 'login' = 'login';

  private mainGroup!: Phaser.GameObjects.Group;
  private formGroup!: Phaser.GameObjects.Group;
  private busyGroup!: Phaser.GameObjects.Group;

  private formTitle!: Phaser.GameObjects.Text;
  private usernameField!: Phaser.GameObjects.Text;
  private passwordField!: Phaser.GameObjects.Text;
  private usernameLabel!: Phaser.GameObjects.Text;
  private passwordLabel!: Phaser.GameObjects.Text;
  private submitBtn!: Phaser.GameObjects.Text;
  private errorText!: Phaser.GameObjects.Text;
  private busyText!: Phaser.GameObjects.Text;

  private username = '';
  private password = '';
  private focused: Field = 'username';

  constructor() {
    super({ key: 'AuthScene' });
  }

  create(): void {
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;

    this.add.text(cx, cy - 260, 'PIKOPARK\nONLINE', {
      ...FONT, fontSize: '36px', color: '#ffffff', align: 'center',
      lineSpacing: 16,
    }).setOrigin(0.5);

    // ── Main group ──────────────────────────────────────────────────────────
    const subtitle = this.add.text(cx, cy - 90, 'WELCOME', {
      ...FONT, fontSize: '16px', color: '#aaaaaa',
    }).setOrigin(0.5);

    const createBtn = this.makeButton(cx, cy - 20, 'CREATE ACCOUNT', '#00ff88', () => {
      this.showForm('register');
    });
    const loginBtn = this.makeButton(cx, cy + 50, 'LOG IN', '#00ccff', () => {
      this.showForm('login');
    });
    const guestBtn = this.makeButton(cx, cy + 120, 'PLAY AS GUEST', '#ffff00', () => {
      this.chooseGuest();
    });
    const hint = this.add.text(cx, cy + 180,
      'accounts keep your name across games · guests get a random one', {
      ...FONT, fontSize: '9px', color: '#555555', align: 'center',
    }).setOrigin(0.5);

    this.mainGroup = this.add.group([subtitle, createBtn, loginBtn, guestBtn, hint]);

    // ── Form group (register/login share the same form, title flips) ───────
    this.formTitle = this.add.text(cx, cy - 120, 'LOG IN', {
      ...FONT, fontSize: '20px', color: '#00ccff',
    }).setOrigin(0.5);

    this.usernameLabel = this.add.text(cx - 160, cy - 50, 'USERNAME', {
      ...FONT, fontSize: '10px', color: '#888888',
    }).setOrigin(0, 0.5);
    this.usernameField = this.add.text(cx - 160, cy - 22, '_', {
      ...FONT, fontSize: '14px', color: '#ffffff',
      backgroundColor: '#222244', padding: { x: 8, y: 6 },
      fixedWidth: 320,
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    this.usernameField.on('pointerdown', () => this.focusField('username'));

    this.passwordLabel = this.add.text(cx - 160, cy + 22, 'PASSWORD', {
      ...FONT, fontSize: '10px', color: '#888888',
    }).setOrigin(0, 0.5);
    this.passwordField = this.add.text(cx - 160, cy + 50, '', {
      ...FONT, fontSize: '14px', color: '#ffffff',
      backgroundColor: '#222244', padding: { x: 8, y: 6 },
      fixedWidth: 320,
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    this.passwordField.on('pointerdown', () => this.focusField('password'));

    this.submitBtn = this.makeButton(cx, cy + 120, 'LOG IN', '#00ccff', () => {
      this.submit();
    });

    const backBtn = this.makeButton(cx, cy + 180, 'BACK', '#666666', () => {
      this.showMain();
    });

    this.errorText = this.add.text(cx, cy + 220, '', {
      ...FONT, fontSize: '10px', color: '#ff4444', align: 'center',
      wordWrap: { width: 420 },
    }).setOrigin(0.5);

    this.formGroup = this.add.group([
      this.formTitle, this.usernameLabel, this.usernameField,
      this.passwordLabel, this.passwordField,
      this.submitBtn, backBtn, this.errorText,
    ]);
    this.formGroup.setVisible(false);

    // ── Busy overlay (shown during HTTP round-trip) ─────────────────────────
    this.busyText = this.add.text(cx, cy, 'Contacting server...', {
      ...FONT, fontSize: '18px', color: '#ffff00',
    }).setOrigin(0.5);
    this.busyGroup = this.add.group([this.busyText]);
    this.busyGroup.setVisible(false);

    // ── Keyboard input ──────────────────────────────────────────────────────
    this.input.keyboard!.on('keydown', this.handleKeydown, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard!.off('keydown', this.handleKeydown, this);
    });

    // If we somehow got mounted with a cached account, skip straight through.
    if (loadStoredAccount() !== null) {
      this.scene.start('MenuScene');
    }
  }

  // ─── Mode transitions ────────────────────────────────────────────────────

  private hideAll(): void {
    this.mainGroup.setVisible(false);
    this.formGroup.setVisible(false);
    this.busyGroup.setVisible(false);
  }

  private showMain(): void {
    this.mode = 'main';
    this.username = '';
    this.password = '';
    this.hideAll();
    this.mainGroup.setVisible(true);
  }

  private showForm(which: 'register' | 'login'): void {
    this.mode = which;
    this.formMode = which;
    this.username = '';
    this.password = '';
    this.focused = 'username';
    this.errorText.setText('');

    const label = which === 'register' ? 'CREATE ACCOUNT' : 'LOG IN';
    const color = which === 'register' ? '#00ff88' : '#00ccff';
    this.formTitle.setText(label).setColor(color);
    this.submitBtn.setText(label).setColor(color);

    this.refreshFields();

    this.hideAll();
    this.formGroup.setVisible(true);
  }

  private showBusy(message: string): void {
    this.mode = 'busy';
    this.busyText.setText(message);
    this.hideAll();
    this.busyGroup.setVisible(true);
  }

  // ─── Input handling ──────────────────────────────────────────────────────

  private handleKeydown(event: KeyboardEvent): void {
    if (this.mode !== 'register' && this.mode !== 'login') return;

    const k = event.key;
    if (k === 'Tab') {
      event.preventDefault();
      this.focusField(this.focused === 'username' ? 'password' : 'username');
      return;
    }
    if (k === 'Enter') {
      this.submit();
      return;
    }
    if (k === 'Escape') {
      this.showMain();
      return;
    }
    if (k === 'Backspace') {
      if (this.focused === 'username') this.username = this.username.slice(0, -1);
      else this.password = this.password.slice(0, -1);
      this.refreshFields();
      return;
    }
    // Single-char keys only. Ignore Shift, Ctrl, etc.
    if (k.length === 1) {
      if (this.focused === 'username') {
        if (/^[A-Za-z0-9_]$/.test(k) && this.username.length < 20) {
          this.username += k;
        }
      } else {
        if (k !== ' ' && this.password.length < 64) {
          this.password += k;
        }
      }
      this.refreshFields();
    }
  }

  private focusField(which: Field): void {
    this.focused = which;
    this.refreshFields();
  }

  private refreshFields(): void {
    const caret = this.focused === 'username' ? '_' : '';
    this.usernameField.setText(this.username + caret);
    this.usernameField.setBackgroundColor(this.focused === 'username' ? '#334466' : '#222244');

    const mask = '*'.repeat(this.password.length);
    const pwCaret = this.focused === 'password' ? '_' : '';
    this.passwordField.setText(mask + pwCaret);
    this.passwordField.setBackgroundColor(this.focused === 'password' ? '#334466' : '#222244');
  }

  // ─── Actions ─────────────────────────────────────────────────────────────

  private chooseGuest(): void {
    storeAccount({ username: '', isGuest: true });
    this.scene.start('MenuScene');
  }

  private submit(): void {
    if (!this.username.trim()) {
      this.errorText.setText('Enter a username');
      return;
    }
    if (!this.password) {
      this.errorText.setText('Enter a password');
      return;
    }
    const endpoint = this.formMode === 'register' ? '/auth/register' : '/auth/login';
    const label = this.formMode === 'register' ? 'Creating account...' : 'Logging in...';

    this.showBusy(label);

    fetch(`${HTTP_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: this.username, password: this.password }),
    })
      .then(async (res) => {
        const body = await res.json() as { username?: string; error?: string };
        if (!res.ok) {
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        return body;
      })
      .then((body) => {
        storeAccount({ username: body.username ?? this.username, isGuest: false });
        this.scene.start('MenuScene');
      })
      .catch((err: Error) => {
        console.warn('[AuthScene]', this.formMode, 'failed:', err.message);
        this.showForm(this.formMode);
        this.errorText.setText(err.message || 'Server unreachable');
      });
  }

  private makeButton(
    x: number, y: number, label: string, color: string, onClick: () => void,
  ): Phaser.GameObjects.Text {
    const btn = this.add.text(x, y, label, {
      ...FONT, fontSize: '18px', color,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor(color));
    btn.on('pointerdown', onClick);
    return btn;
  }
}

// ─── localStorage helpers ──────────────────────────────────────────────────
// Exported so MenuScene/other callers can look up identity or log out
// without duplicating the key constant.

export function loadStoredAccount(): StoredAccount | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null) return null;
    const o = parsed as Record<string, unknown>;
    if (typeof o['username'] !== 'string') return null;
    if (typeof o['isGuest'] !== 'boolean') return null;
    return { username: o['username'], isGuest: o['isGuest'] };
  } catch {
    return null;
  }
}

export function storeAccount(account: StoredAccount): void {
  try { localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account)); }
  catch { /* ignore: private-mode or quota */ }
}

export function clearStoredAccount(): void {
  try { localStorage.removeItem(ACCOUNT_STORAGE_KEY); }
  catch { /* ignore */ }
}
