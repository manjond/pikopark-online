import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from '../constants';
// Level 5 — "Chain"
// Mechanic: relay of two buttons + latching final switch.
//
// Puzzle (2 players):
//   btn5a is a regular pressure-sensitive button.
//   btn5b is a LATCHING button — once stepped on it stays permanently activated.
//
//   Player A stands on btn5a the entire time (holds door5a open).
//   Player B passes through door5a and walks to btn5b.
//   Player B steps on btn5b — it latches permanently, door5b opens for good.
//   Player B (and/or Player A once released) walks through door5b to reach the goal.
const FLOOR_TOP = GAME_HEIGHT - TILE_SIZE;
const PLAYER_ON_FLOOR = GAME_HEIGHT - TILE_SIZE - TILE_SIZE / 2;
export const LEVEL_5 = {
    id: 5,
    name: 'Chain',
    solidRects: [
        { x: 0, y: FLOOR_TOP, width: GAME_WIDTH, height: TILE_SIZE, tileType: 'ground' },
        // Mid platform — gives the level some verticality
        { x: 240, y: 200, width: 80, height: TILE_SIZE, tileType: 'platform' },
    ],
    spawnPoints: [
        { x: 24, y: PLAYER_ON_FLOOR },
        { x: 48, y: PLAYER_ON_FLOOR },
        { x: 72, y: PLAYER_ON_FLOOR },
        { x: 96, y: PLAYER_ON_FLOOR },
    ],
    objects: [
        {
            // Pressure-sensitive relay button — Player A holds this the whole time
            id: 'btn5a',
            type: 'button',
            x: 80,
            y: PLAYER_ON_FLOOR,
            width: TILE_SIZE,
            height: 4,
            requiredPlayers: 1,
            linkedId: 'door5a',
        },
        {
            id: 'door5a',
            type: 'door',
            x: 192,
            y: Math.round(GAME_HEIGHT / 2),
            width: 8,
            height: GAME_HEIGHT,
            requiredPlayers: 0,
            linkedId: 'btn5a',
        },
        {
            // Latching switch — once activated it stays on forever
            id: 'btn5b',
            type: 'button',
            x: 336,
            y: PLAYER_ON_FLOOR,
            width: TILE_SIZE,
            height: 4,
            requiredPlayers: 1,
            linkedId: 'door5b',
            latching: true,
        },
        {
            id: 'door5b',
            type: 'door',
            x: 400,
            y: Math.round(GAME_HEIGHT / 2),
            width: 8,
            height: GAME_HEIGHT,
            requiredPlayers: 0,
            linkedId: 'btn5b',
        },
        {
            id: 'goal5',
            type: 'goal',
            x: 448,
            y: PLAYER_ON_FLOOR,
            width: TILE_SIZE,
            height: TILE_SIZE,
            requiredPlayers: 0,
            linkedId: '',
        },
    ],
};
