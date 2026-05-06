import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorTrap, movingPlatform,
} from './_helpers';

// Level 8 — "Moving Day"  (Solo Adept)
// Two moving platforms ferry the player across wide gaps.
// Each platform has a latching button you must press mid-transit to unlock
// the next section. Map is designed so the player has time to react.

const ferry1W = 96;
const ferry1 = movingPlatform('plat8a', 288, FLOOR_TOP - 64, ferry1W, {
  axis: 'x', from: 288 + ferry1W / 2, to: 700 + ferry1W / 2, speed: 140,
});
const ferry2W = 96;
const ferry2 = movingPlatform('plat8b', 860, FLOOR_TOP - 96, ferry2W, {
  axis: 'x', from: 860 + ferry2W / 2, to: 1200 + ferry2W / 2, speed: 160,
});

export const LEVEL_8: LevelData = {
  id: 8,
  name: 'Moving Day',
  minPlayers: 1,
  mapWidth: 1800,
  solidRects: [
    groundSegment(0, 288),        // spawn
    groundSegment(800, 64),       // mid island
    groundSegment(1300, 500),     // finish section
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('lava8a', 358, 448),   // lava in first gap
    floorTrap('lava8b', 864, 432),   // lava in second gap
    ferry1,
    ferry2,
    // Press button on mid island to unlock door
    floorButton('btn8', 820, 'door8', { latching: true }),
    fullHeightDoor('door8', 1460),
    floorButton('btn8b', 1560, 'door8', { latching: true }),
    goalOnFloor('goal8', 1730),
  ],
};
