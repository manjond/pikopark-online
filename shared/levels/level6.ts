import { LevelData } from '../level';
import {
  fullHeightDoor,
  goalOnPlatform,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 6 — "Lift Off"  (Pack: Duo, 2 players)
// One player is the step-stool; the other stacks and jumps to the button
// platform (stacking-only zone). Door opens → both players reach the goal.
//
// Physics (1280×720):
//   Solo feet peak y   = 421  → solo CANNOT reach platform at y=395
//   Stacked feet peak  = 389  → stacked CAN reach platform at y=395 ✓

const MAP_W = 1280;

const BTN_PLAT  = platformRect(224, 395, 192); // stacking-only
const GOAL_PLAT = platformRect(960, 460, 192); // solo-reachable

export const LEVEL_6: LevelData = {
  id: 6,
  name: 'Lift Off',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), BTN_PLAT, GOAL_PLAT],

  spawnPoints: standardSpawns(),

  objects: [
    platformButton('btn6', BTN_PLAT, 'door6'),
    fullHeightDoor('door6', 640),
    goalOnPlatform('goal6', GOAL_PLAT),
  ],
};
