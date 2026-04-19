import { promises as fs } from 'fs';
import * as path from 'path';

export interface LeaderboardEntry {
  timeMs: number;
  players: string[];     // names of active players at completion
  completedAt: string;   // ISO timestamp
}

interface LeaderboardFile {
  version: 1;
  levels: Record<string, LeaderboardEntry[]>; // key = levelId as string
}

/** Top-N per level; sorted ascending (fastest first). */
const TOP_N = 10;

/**
 * File-backed JSON leaderboard. Single shared instance per server process.
 *
 * Design:
 *   - Persistence path is `process.env.LEADERBOARD_PATH` if set, otherwise
 *     `./data/leaderboard.json` relative to the server's working directory.
 *   - Writes are serialised through a promise chain so concurrent calls
 *     across rooms never interleave and corrupt the file.
 *   - Missing/invalid files are tolerated — we fall back to an empty board.
 *   - The client discovers the board via HTTP (GET /leaderboard) and the
 *     per-room `levelComplete` broadcast includes the current top for that
 *     level so UI can flash NEW RECORD without an extra round-trip.
 */
export class Leaderboard {
  private data: LeaderboardFile = { version: 1, levels: {} };
  private readonly filePath: string;
  private writeQueue: Promise<void> = Promise.resolve();
  private loaded = false;

  constructor(filePath?: string) {
    this.filePath = filePath
      ?? process.env['LEADERBOARD_PATH']
      ?? path.join(process.cwd(), 'data', 'leaderboard.json');
  }

  async load(): Promise<void> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(raw) as unknown;
      if (this.isValid(parsed)) {
        this.data = parsed;
      } else {
        console.warn(`[Leaderboard] ${this.filePath} has invalid shape — starting empty.`);
      }
    } catch (err: unknown) {
      const e = err as NodeJS.ErrnoException;
      if (e.code !== 'ENOENT') {
        console.warn(`[Leaderboard] could not read ${this.filePath}:`, e.message);
      }
    }
    this.loaded = true;
  }

  /** Try to insert an entry. Returns the 1-based rank if it made the board, else null. */
  tryInsert(levelId: number, entry: LeaderboardEntry): number | null {
    const key = String(levelId);
    const arr = this.data.levels[key] ?? [];
    arr.push(entry);
    arr.sort((a, b) => a.timeMs - b.timeMs);
    const trimmed = arr.slice(0, TOP_N);
    this.data.levels[key] = trimmed;

    const rankIdx = trimmed.indexOf(entry);
    if (rankIdx === -1) return null;
    this.scheduleSave();
    return rankIdx + 1;
  }

  getTop(levelId: number): LeaderboardEntry[] {
    return this.data.levels[String(levelId)] ?? [];
  }

  getAll(): Record<string, LeaderboardEntry[]> {
    return this.data.levels;
  }

  private scheduleSave(): void {
    this.writeQueue = this.writeQueue.then(() => this.writeNow()).catch((err) => {
      console.error('[Leaderboard] save failed:', err);
    });
  }

  private async writeNow(): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
    // Atomic write: tempfile + rename avoids partial writes if the process crashes.
    const tmp = `${this.filePath}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(this.data, null, 2), 'utf8');
    await fs.rename(tmp, this.filePath);
  }

  private isValid(v: unknown): v is LeaderboardFile {
    if (typeof v !== 'object' || v === null) return false;
    const o = v as Record<string, unknown>;
    if (o['version'] !== 1) return false;
    if (typeof o['levels'] !== 'object' || o['levels'] === null) return false;
    return true;
  }
}

// ─── Singleton accessor ────────────────────────────────────────────────────────
// Every GameRoom shares the same leaderboard instance. load() is called once
// during server startup (see index.ts).

let _singleton: Leaderboard | null = null;

export function leaderboardInstance(): Leaderboard {
  if (_singleton === null) _singleton = new Leaderboard();
  return _singleton;
}
