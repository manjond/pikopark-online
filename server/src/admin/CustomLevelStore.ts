import { promises as fs } from 'fs';
import * as path from 'path';
import { LevelData, validateLevel } from '@pikopark/shared';

/**
 * One stored custom level together with the author who created it. Levels
 * are keyed by `${author}:${slug}` internally — slug comes from the human
 * name, so two admins can both have a level called "Test" without clashing.
 */
export interface CustomLevel {
  author: string;      // original-casing username
  slug: string;        // URL-safe slug derived from `data.name`
  data: LevelData;
  createdAt: string;   // ISO timestamp
  updatedAt: string;   // ISO timestamp
}

interface CustomLevelFile {
  version: 1;
  levels: Record<string, CustomLevel>; // keyed by `${author.toLowerCase()}:${slug}`
}

/**
 * File-backed store for admin-created levels. Follows the same atomic-write
 * pattern as AccountStore / Leaderboard: tmp-file + rename, with a write
 * queue to serialise concurrent saves.
 *
 * The shape is deliberately simple — everything fits in one JSON file and
 * we never plan to have thousands of custom levels. If that changes, move
 * to sqlite.
 */
export class CustomLevelStore {
  private data: CustomLevelFile = { version: 1, levels: {} };
  private readonly filePath: string;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(filePath?: string) {
    this.filePath = filePath
      ?? process.env['CUSTOM_LEVELS_PATH']
      ?? path.join(process.cwd(), 'data', 'custom_levels.json');
  }

  async load(): Promise<void> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(raw) as unknown;
      if (this.isValid(parsed)) {
        this.data = parsed;
      } else {
        console.warn(`[CustomLevelStore] ${this.filePath} has invalid shape — starting empty.`);
      }
    } catch (err: unknown) {
      const e = err as NodeJS.ErrnoException;
      if (e.code !== 'ENOENT') {
        console.warn(`[CustomLevelStore] could not read ${this.filePath}:`, e.message);
      }
    }
  }

  /** Returns every stored level. */
  listAll(): CustomLevel[] {
    return Object.values(this.data.levels);
  }

  /** Returns levels created by a specific user (by lowercased username). */
  listByAuthor(username: string): CustomLevel[] {
    const author = username.toLowerCase();
    return Object.values(this.data.levels).filter((l) => l.author.toLowerCase() === author);
  }

  /**
   * Upsert a level. Returns the stored entry on success, or an error the
   * caller can surface via HTTP status.
   */
  async save(
    author: string,
    level: LevelData,
  ): Promise<{ ok: true; level: CustomLevel } | { ok: false; error: string; code: number }> {
    // Validate the level against the normal rules before persisting so broken
    // levels can never reach the play path.
    const issues = validateLevel(level, level.minPlayers);
    const fatal = issues.filter((i) => i.severity === 'error');
    if (fatal.length > 0) {
      return { ok: false, error: fatal[0]!.message, code: 400 };
    }

    const slug = slugify(level.name);
    if (!slug) {
      return { ok: false, error: 'Level name must contain at least one letter or digit', code: 400 };
    }
    const key = `${author.toLowerCase()}:${slug}`;
    const now = new Date().toISOString();
    const existing = this.data.levels[key];
    this.data.levels[key] = {
      author,
      slug,
      data: level,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await this.flush();
    return { ok: true, level: this.data.levels[key]! };
  }

  async delete(author: string, slug: string): Promise<boolean> {
    const key = `${author.toLowerCase()}:${slug}`;
    if (!this.data.levels[key]) return false;
    delete this.data.levels[key];
    await this.flush();
    return true;
  }

  private async flush(): Promise<void> {
    const save = this.writeQueue.then(() => this.writeNow()).catch((err) => {
      console.error('[CustomLevelStore] save failed:', err);
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

  private isValid(v: unknown): v is CustomLevelFile {
    if (typeof v !== 'object' || v === null) return false;
    const o = v as Record<string, unknown>;
    if (o['version'] !== 1) return false;
    if (typeof o['levels'] !== 'object' || o['levels'] === null) return false;
    return true;
  }
}

/** URL-safe slug: lowercase alphanumerics + dashes, trimmed. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

let _singleton: CustomLevelStore | null = null;
export function customLevelStoreInstance(): CustomLevelStore {
  if (_singleton === null) _singleton = new CustomLevelStore();
  return _singleton;
}
