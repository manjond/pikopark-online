import { LevelData } from '../level';
import {
  crumblePlatform,
  fireBar,
  floorTrap,
  goalOnFloor,
  groundRect,
  icePlatform,
  movingPlatform,
  standardSpawns,
} from './_helpers';

// Level 12 — "Inferno"  (Pack: Solo Master, 1 player)
// Three back-to-back hazard sections in one wide arena. Section 1: a
// crumble bridge over lava. Section 2: a horizontal ferry threading two
// firebars. Section 3: a long ice slide that ends on a narrow safe strip
// inches before more lava. Run, ride, brake, breathe.

const MAP_W = 1920;

export const LEVEL_12: LevelData = {
  id: 12,
  name: 'Inferno',
  minPlayers: 1,
  mapWidth: MAP_W,

  solidRects: [
    groundRect(MAP_W),
    icePlatform(1184, 565, 480),     // section 3 ice slide
  ],

  spawnPoints: standardSpawns(),

  objects: [
    // Section 1 — crumble bridge over lava.
    floorTrap('trap12a', 416, 288),
    crumblePlatform('cr12a', 320, 565, 96),
    crumblePlatform('cr12b', 432, 565, 96),
    crumblePlatform('cr12c', 544, 565, 96),

    // Section 2 — horizontal ferry threading two firebars.
    floorTrap('trap12b', 832, 384),
    movingPlatform('mp12', 656, 470, 128, {
      axis: 'x',
      from: 656 + 64,
      to:   976 + 64,
      speed: 200,
    }),
    fireBar('fb12a', 752, 380, 2, 1.4,  0),
    fireBar('fb12b', 944, 380, 2, -1.4, 90),

    // Section 3 — ice slide ends right before the final lava strip.
    floorTrap('trap12c', 1664, 64),
    goalOnFloor('goal12', 1820),
  ],
};
