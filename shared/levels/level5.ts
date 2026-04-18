import { LevelData } from '../level';
import {
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 5 — "Grand Tour"  (Pack: Basics, 1 player)
// Wide map (1920px). Three latching buttons scattered across three sections.
// All three must be pressed to open the final door. Find them all!

const MAP_W = 1920;

const PLAT_A  = platformRect(256,  507, 192);  // left section
const PLAT_B1 = platformRect(768,  560, 192);  // stepping stone
const PLAT_B  = platformRect(864,  460, 192);  // middle section
const PLAT_C  = platformRect(1408, 507, 192);  // right section

export const LEVEL_5: LevelData = {
  id: 5,
  name: 'Grand Tour',
  minPlayers: 1,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), PLAT_A, PLAT_B1, PLAT_B, PLAT_C],

  spawnPoints: standardSpawns(),

  objects: [
    platformButton('btn5a', PLAT_A, 'door5', { latching: true }),
    platformButton('btn5b', PLAT_B, 'door5', { latching: true }),
    platformButton('btn5c', PLAT_C, 'door5', { latching: true }),
    fullHeightDoor('door5', 1728),
    goalOnFloor('goal5', 1888),
  ],
};
