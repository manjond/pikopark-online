import { LevelData } from '../level';
import {
  floorButton,
  fullHeightDoor,
  goalOnPlatform,
  groundRect,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 4 — "Chain"  (Pack: Basics, 1 player)
// Sequential button chain. Press button A (latching) → door A opens.
// Inside find button B (latching) → door B opens. Goal on elevated platform.

const GOAL_PLAT = platformRect(960, 460, 224);

export const LEVEL_4: LevelData = {
  id: 4,
  name: 'Chain',
  minPlayers: 1,

  solidRects: [groundRect(), GOAL_PLAT],

  spawnPoints: standardSpawns(4, 64, 64),

  objects: [
    floorButton('btn4a', 299, 'door4a', { latching: true }),
    fullHeightDoor('door4a', 512, 'btn4a'),
    floorButton('btn4b', 726, 'door4b', { latching: true }),
    fullHeightDoor('door4b', 896, 'btn4b'),
    goalOnPlatform('goal4', GOAL_PLAT),
  ],
};
