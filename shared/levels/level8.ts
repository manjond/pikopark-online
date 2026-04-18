import { LevelData } from '../level';
import {
  fullHeightDoor,
  goalOnPlatform,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 8 — "Double Stack"  (Pack: Duo, 2 players)
// Two stacking-only platforms in sequence, each with a latching button.
// Both must be activated (via stacking) before the final door opens.
// Because buttons are latching, only ONE player needs to reach each — but
// stacking IS required to get there.

const MAP_W = 1280;

const PLAT_A    = platformRect(224, 410, 160); // stacking-only
const PLAT_B    = platformRect(672, 395, 160); // stacking-only, harder
const GOAL_PLAT = platformRect(992, 470, 192); // solo-reachable

export const LEVEL_8: LevelData = {
  id: 8,
  name: 'Double Stack',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), PLAT_A, PLAT_B, GOAL_PLAT],

  spawnPoints: standardSpawns(),

  objects: [
    platformButton('btn8a', PLAT_A, 'door8', { latching: true }),
    platformButton('btn8b', PLAT_B, 'door8', { latching: true }),
    fullHeightDoor('door8', 853),
    goalOnPlatform('goal8', GOAL_PLAT),
  ],
};
