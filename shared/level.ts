// ─── Level data types — used by both server (physics) and client (rendering) ──

export type TileType = 'ground' | 'platform';

/** Axis-aligned rectangle defining a solid collision surface. Top-left origin. */
export interface SolidRect {
  x: number;      // left edge
  y: number;      // top edge
  width: number;
  height: number;
  tileType: TileType;
}

export interface SpawnPoint {
  x: number;  // player center
  y: number;  // player center
}

export interface LevelObjectDef {
  id: string;
  type: 'button' | 'door' | 'goal' | 'trap';
  x: number;      // center x
  y: number;      // center y
  width: number;
  height: number;
  requiredPlayers: number;
  /** ID of the object this one activates (button → door). */
  linkedId: string;
  /** If true the button latches permanently after first trigger (not pressure-sensitive). */
  latching?: boolean;
}

export interface LevelData {
  id: number;
  name: string;
  /** Minimum players required to attempt this level. */
  minPlayers: number;
  /** Total map width in pixels. Defaults to GAME_WIDTH if omitted. */
  mapWidth?: number;
  solidRects: SolidRect[];
  spawnPoints: SpawnPoint[];
  objects: LevelObjectDef[];
}

/** A named collection of levels with a shared minimum-player requirement. */
export interface LevelPack {
  id: string;
  name: string;
  /** Minimum players needed to play any level in this pack. */
  minPlayers: number;
  levels: LevelData[];
}
