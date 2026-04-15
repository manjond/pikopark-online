export type TileType = 'ground' | 'platform';
/** Axis-aligned rectangle defining a solid collision surface. Top-left origin. */
export interface SolidRect {
    x: number;
    y: number;
    width: number;
    height: number;
    tileType: TileType;
}
export interface SpawnPoint {
    x: number;
    y: number;
}
export interface LevelObjectDef {
    id: string;
    type: 'button' | 'door' | 'goal';
    x: number;
    y: number;
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
    solidRects: SolidRect[];
    spawnPoints: SpawnPoint[];
    objects: LevelObjectDef[];
}
