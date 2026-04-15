import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../constants';
// Level 3 — "Up and Over"
// Mechanic: combine stacking (from L2) with button→door (from L1).
//
// Puzzle (2 players):
//   The button sits on a HIGH platform (only reachable by stacking).
//   A door blocks the path to the goal.
//   Player A stands still as a step-stool on the ground below the platform.
//   Player B jumps on A's head, then jumps onto the high platform and steps on the button.
//   The door opens. Player A walks through the open door to reach the goal.
//
// Physics reminder:
//   Solo jump reach (player bottom peak): FLOOR_Y+8 − 100 = 154
//   Stacked jump reach (player bottom peak): (FLOOR_Y−8)+8 − 100 = 138
//   Button platform top = 148  → unreachable solo, reachable stacked  ✓
const FLOOR_TOP = GAME_HEIGHT - TILE_SIZE; // 254
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2; // 246
const BTN_PLATFORM_X = 96;
const BTN_PLATFORM_W = 80;
const BTN_PLATFORM_TOP = 148;
export const LEVEL_3 = {
    id: 3,
    name: 'Up and Over',
    solidRects: [
        { x: 0, y: FLOOR_TOP, width: GAME_WIDTH, height: TILE_SIZE, tileType: 'ground' },
        // Button platform — only reachable by stacking
        { x: BTN_PLATFORM_X, y: BTN_PLATFORM_TOP, width: BTN_PLATFORM_W, height: TILE_SIZE, tileType: 'platform' },
    ],
    spawnPoints: [
        { x: 24, y: PLAYER_ON_FLOOR },
        { x: 48, y: PLAYER_ON_FLOOR },
        { x: 72, y: PLAYER_ON_FLOOR },
        { x: 96, y: PLAYER_ON_FLOOR },
    ],
    objects: [
        {
            id: 'btn3',
            type: 'button',
            x: BTN_PLATFORM_X + BTN_PLATFORM_W / 2, // 136 — centre of platform
            y: BTN_PLATFORM_TOP - TILE_SIZE / 2, // 140 — visual sits on top
            width: BTN_PLATFORM_W,
            height: 4,
            requiredPlayers: 1,
            linkedId: 'door3',
        },
        {
            id: 'door3',
            type: 'door',
            x: 256,
            y: Math.round(GAME_HEIGHT / 2), // 135 — full-height barrier
            width: 8,
            height: GAME_HEIGHT,
            requiredPlayers: 0,
            linkedId: 'btn3',
        },
        {
            id: 'goal3',
            type: 'goal',
            x: 432,
            y: PLAYER_ON_FLOOR, // 246 — goal on the ground, behind door
            width: TILE_SIZE,
            height: TILE_SIZE,
            requiredPlayers: 0,
            linkedId: '',
        },
    ],
};
