import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface StoredAccount {
  username: string;
  passwordHash: string; // hex-encoded scrypt output
  salt: string;         // hex-encoded random salt
  createdAt: string;    // ISO timestamp
}

interface AccountsFile {
  version: 1;
  accounts: Record<string, StoredAccount>; // keyed by lowercased username
}

const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;
const MIN_PASSWORD_LEN = 6;
const MAX_PASSWORD_LEN = 64;

/**
 * File-backed account store. Follows the same atomic-write/queue pattern
 * as Leaderboard so two concurrent registrations can't corrupt the JSON.
 *
 * Not a replacement for a real auth system — there is no session token,
 * rate limiting, or email verification. The threat model here is "prevent
 * casual impersonation between friends", not "withstand attack".
 */
export class AccountStore {
  private data: AccountsFile = { version: 1, accounts: {} };
  private readonly filePath: string;
  private writeQueue: Promise<void> = Promise.resolve();
  private loaded = false;

  constructor(filePath?: string) {
    this.filePath = filePath
      ?? process.env['ACCOUNTS_PATH']
      ?? path.join(process.cwd(), 'data', 'accounts.json');
  }

  async load(): Promise<void> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(raw) as unknown;
      if (this.isValid(parsed)) {
        this.data = parsed;
      } else {
        console.warn(`[AccountStore] ${this.filePath} has invalid shape — starting empty.`);
      }
    } catch (err: unknown) {
      const e = err as NodeJS.ErrnoException;
      if (e.code !== 'ENOENT') {
        console.warn(`[AccountStore] could not read ${this.filePath}:`, e.message);
      }
    }
    this.loaded = true;
  }

  async register(username: string, password: string): Promise<{ ok: true; username: string } | { ok: false; error: string; code: number }> {
    const validation = this.validateCredentials(username, password);
    if (!validation.ok) return validation;

    const key = username.toLowerCase();
    if (this.data.accounts[key]) {
      return { ok: false, error: 'Username already taken', code: 409 };
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');
    this.data.accounts[key] = {
      username, // preserve original casing for display
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
    };
    await this.flush();
    return { ok: true, username };
  }

  async login(username: string, password: string): Promise<{ ok: true; username: string } | { ok: false; error: string; code: number }> {
    const validation = this.validateCredentials(username, password);
    if (!validation.ok) return validation;

    const key = username.toLowerCase();
    const acct = this.data.accounts[key];
    if (!acct) {
      return { ok: false, error: 'Invalid username or password', code: 401 };
    }
    const candidate = crypto.scryptSync(password, acct.salt, 64).toString('hex');
    // Constant-time compare so we don't leak via timing.
    const a = Buffer.from(candidate, 'hex');
    const b = Buffer.from(acct.passwordHash, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { ok: false, error: 'Invalid username or password', code: 401 };
    }
    return { ok: true, username: acct.username };
  }

  private validateCredentials(
    username: unknown, password: unknown,
  ): { ok: true } | { ok: false; error: string; code: number } {
    if (typeof username !== 'string' || !USERNAME_RE.test(username)) {
      return { ok: false, error: 'Username must be 3–20 chars: letters, digits, underscore', code: 400 };
    }
    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LEN || password.length > MAX_PASSWORD_LEN) {
      return { ok: false, error: `Password must be ${MIN_PASSWORD_LEN}–${MAX_PASSWORD_LEN} characters`, code: 400 };
    }
    return { ok: true };
  }

  private async flush(): Promise<void> {
    const save = this.writeQueue.then(() => this.writeNow()).catch((err) => {
      console.error('[AccountStore] save failed:', err);
    });
    this.writeQueue = save;
    await save;
  }

  private async writeNow(): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
    const tmp = `${this.filePath}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(this.data, null, 2), 'utf8');
    await fs.rename(tmp, this.filePath);
  }

  private isValid(v: unknown): v is AccountsFile {
    if (typeof v !== 'object' || v === null) return false;
    const o = v as Record<string, unknown>;
    if (o['version'] !== 1) return false;
    if (typeof o['accounts'] !== 'object' || o['accounts'] === null) return false;
    return true;
  }
}

let _singleton: AccountStore | null = null;
export function accountStoreInstance(): AccountStore {
  if (_singleton === null) _singleton = new AccountStore();
  return _singleton;
}
