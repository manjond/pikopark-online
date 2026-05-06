import { LevelData } from '../level';
import {
  FLOOR_TOP, STACK2_FEET_PEAK, STACK3_FEET_PEAK,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorTrap, crumblePlatform,
} from './_helpers';

// Level 21 — "Double Cross"  (Duo Synergy)
// Two crumble bridges over separate lava pits. Players must cross together
// timing their hops so neither lags behind. Buttons on far side are latching.

export const LEVEL_21: LevelData = {
  id: 21,
  name: 'Double Cross',
  minPlayers: 2,
  mapWidth: 2000,
  solidRects: [
    groundSegment(0, 280),
    groundSegment(760, 280),
    groundSegment(1440, 560),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('lava21a', 290, 462),
    crumblePlatform('cr21a', 256, FLOOR_TOP - 32, 96),
    crumblePlatform('cr21b', 400, FLOOR_TOP - 32, 96),
    crumblePlatform('cr21c', 544, FLOOR_TOP - 32, 96),
    crumblePlatform('cr21d', 688, FLOOR_TOP - 32, 96),
    floorTrap('lava21b', 1040, 394),
    crumblePlatform('cr21e', 1024, FLOOR_TOP - 32, 96),
    crumblePlatform('cr21f', 1168, FLOOR_TOP - 32, 96),
    crumblePlatform('cr21g', 1312, FLOOR_TOP - 32, 96),
    floorButton('btn21', 1500, 'door21', { latching: true }),
    fullHeightDoor('door21', 1700),
    floorButton('btn21b', 1810, 'door21', { latching: true }),
    goalOnFloor('goal21', 1940),
  ],
};
