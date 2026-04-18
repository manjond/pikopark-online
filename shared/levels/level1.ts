import { TILE_SIZE } from '../constants';
import { LevelData } from '../level';
import {
  floorButton,
  fullHeightDoor,
  groundRect,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 1 — "First Steps"  (Pack: Basics, 1 player)
// Three ascending platforms. Press the floor button to open the door, then
// climb the chain of platforms to reach the goal on the highest one.
//
// Physics (1280×720):
//   Solo feet peak 421 → platforms at y=565/472 are solo-reachable.
//   Goal platform top 365 < 421, but reachable from the mid platform at 472.

const GOAL_PLAT = platformRect(981, 365, 213);

export const LEVEL_1: LevelData = {
  id: 1,
  name: 'First Steps',
  minPlayers: 1,

  solidRects: [
    groundRect(),
    platformRect(128, 565, 299),
    platformRect(597, 472, 299),
    GOAL_PLAT,
  ],

  spawnPoints: standardSpawns(4, 21, 64),

  objects: [
    floorButton('btn1', 299, 'door1'),
    fullHeightDoor('door1', 512, 'btn1'),
    // Goal x=1088 is the original hand-set value (platform center is 1087.5).
    {
      id: 'goal1',
      type: 'goal',
      x: 1088,
      y: GOAL_PLAT.y - TILE_SIZE / 2,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    },
  ],
};
