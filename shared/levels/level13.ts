import { LevelData } from '../level';
import {
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 13 — "Split Decision"  (Pack: Squad, 4 players)
// Wide 2560px map. Two parallel corridors separated by a wall in the middle.
// Top corridor requires stacking; bottom corridor has a 2-player simultaneous button.
// Both corridors must be cleared (two latching buttons) to open the final door.
//
// Layout:
//   Bottom corridor: floor level — btn13a (2-player wide, latching) → unlocks corridor gate
//   Top corridor: elevated platform route — btn13b (1-player, latching via 2-stack) → unlatches gate
//   Both btn13a + btn13b → door13 (AND logic) → goal at far right

const MAP_W = 2560;

const STACK_PLAT = platformRect(960, 400, 192); // stacking-only (2-stack)

export const LEVEL_13: LevelData = {
  id: 13,
  name: 'Split Decision',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [
    groundRect(MAP_W),
    // Upper route — stepping platforms
    platformRect(320,  530, 192),
    platformRect(640,  460, 192),
    STACK_PLAT,
    // Lower route — stepping stones
    platformRect(1280, 560, 192),
    platformRect(1600, 530, 192),
    // Final section landing platform
    platformRect(2176, 500, 256),
  ],

  spawnPoints: standardSpawns(),

  objects: [
    // Bottom-route 2-player latching button
    floorButton('btn13a', 1920, 'door13', { latching: true, requiredPlayers: 2, width: 128 }),
    // Top-route stacking-only latching button
    platformButton('btn13b', STACK_PLAT, 'door13', { latching: true }),
    fullHeightDoor('door13', 2112),
    goalOnFloor('goal13', 2400),
  ],
};
