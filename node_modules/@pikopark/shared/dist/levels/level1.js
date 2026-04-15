import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../constants';
// Derived layout constants (all in pixels, Phaser y-down coordinate space)
const FLOOR_TOP = GAME_HEIGHT - TILE_SIZE; // 254 — top edge of ground tile
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 246 — player center on ground
export const LEVEL_1 = {
    id: 1,
    name: 'Level 1',
    // ─── Solid geometry ─────────────────────────────────────────────────────────
    // Coordinates: top-left x,y with width×height.
    // These match the client's original PLATFORMS array exactly:
    //   Platform 1: col 3–9  → x=48,  top=212  (centerY=220)
    //   Platform 2: col 14–20 → x=224, top=177  (centerY=185)
    //   Platform 3: col 23–27 → x=368, top=137  (centerY=145)
    solidRects: [
        { x: 0, y: FLOOR_TOP, width: GAME_WIDTH, height: TILE_SIZE, tileType: 'ground' },
        { x: 48, y: 212, width: 112, height: TILE_SIZE, tileType: 'platform' },
        { x: 224, y: 177, width: 112, height: TILE_SIZE, tileType: 'platform' },
        { x: 368, y: 137, width: 80, height: TILE_SIZE, tileType: 'platform' },
    ],
    // ─── Spawn points ────────────────────────────────────────────────────────────
    // Match the server's stagger formula: x = TILE_SIZE/2 + index*(TILE_SIZE+8)
    spawnPoints: [
        { x: 8, y: PLAYER_ON_FLOOR },
        { x: 32, y: PLAYER_ON_FLOOR },
        { x: 56, y: PLAYER_ON_FLOOR },
        { x: 80, y: PLAYER_ON_FLOOR },
    ],
    // ─── Interactive objects ─────────────────────────────────────────────────────
    //
    // Puzzle flow:
    //   Player A stands on btn1 (x=112, ground) → door1 (x=192) opens.
    //   Player B runs right through the open door, jumps up:
    //     ground → left-platform (y=220) is blocked by the door, so go RIGHT
    //     right side: mid-platform (y=185, x=224–336) → high-platform (y=145, x=368–448)
    //   Player B touches the goal star (x=408) on the high platform → level complete!
    objects: [
        {
            id: 'btn1',
            type: 'button',
            x: 112, // ground, between spawn area and door
            y: PLAYER_ON_FLOOR, // 246 — detected by x overlap + isGrounded
            width: TILE_SIZE,
            height: 4,
            requiredPlayers: 1,
            linkedId: 'door1',
        },
        {
            id: 'door1',
            type: 'door',
            x: 192, // between left platform (x≤160) and mid platform (x≥224)
            y: Math.round(GAME_HEIGHT / 2), // 135 — full-height barrier
            width: 8,
            height: GAME_HEIGHT,
            requiredPlayers: 0,
            linkedId: 'btn1',
        },
        {
            // Goal star — on the high platform (col 25, y=145 top → player center y=137)
            // Reachable only by passing through the door: mid-platform → high-platform → goal
            id: 'goal1',
            type: 'goal',
            x: 408, // col 25 center (25*16+8=408), inside high platform
            y: 137 - TILE_SIZE / 2, // 129 — player center when standing on high platform top (137)
            width: TILE_SIZE,
            height: TILE_SIZE,
            requiredPlayers: 0,
            linkedId: '',
        },
    ],
};
