import { LevelData } from '../level';
import { TILE_SIZE } from '../constants';
import {
  floorSpring,
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 34 — "Spring Squad"  (Pack: Squad Crew, 4 players)
// Four spring pads launch four players up to four high latching buttons.
// Buttons live in the spring-only band (y around 200) — too high for any
// solo/stack/throw, only a spring reaches. All four must latch to open
// the goal door. The 4th twist: a lava strip on the floor between the
// fourth pad and the goal — only cold while one player holds the central
// pressure pedestal. So three latch their springs, then the four players
// must replay: one holds the pedestal, the others traverse to the goal.

const MAP_W = 2240;
const TILE = TILE_SIZE;

const PAD1 = platformRect(192,  200, 192);
const PAD2 = platformRect(640,  200, 192);
const PAD3 = platformRect(1088, 200, 192);
const PAD4 = platformRect(1536, 200, 192);
const PED  = platformRect(1024, 540, 192);

export const LEVEL_34: LevelData = {
  id: 34,
  name: 'Spring Squad',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), PAD1, PAD2, PAD3, PAD4, PED],
  spawnPoints: standardSpawns(),

  objects: [
    floorSpring('s34a',  288),
    floorSpring('s34b',  736),
    floorSpring('s34c', 1184),
    floorSpring('s34d', 1632),
    platformButton('b34a', PAD1, 'door34', { latching: true, width: TILE, yOffset: 4 }),
    platformButton('b34b', PAD2, 'door34', { latching: true, width: TILE, yOffset: 4 }),
    platformButton('b34c', PAD3, 'door34', { latching: true, width: TILE, yOffset: 4 }),
    platformButton('b34d', PAD4, 'door34', { latching: true, width: TILE, yOffset: 4 }),
    // Pedestal pressure pad — holds the lava cold.
    platformButton('b34hold', PED, 'trap34', { width: 192 }),
    floorTrap('trap34', 1856, 320),
    fullHeightDoor('door34', 2080),
    goalOnFloor('goal34', 2176),
  ],
};
