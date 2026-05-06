import { LevelData } from '../level';
import {
  FLOOR_TOP, STACK3_FEET_PEAK,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorTrap,
} from './_helpers';

// Level 32 — "Triple Stack"  (Squad Crew)
// A button on a platform only reachable via 3-player stack jump (y=STACK3).
// One player stands, a second stands on their head, the third climbs and
// presses the button. Fourth player watches the door.

const stackPlat = platformRect(700, STACK3_FEET_PEAK, 128);   // y=357

export const LEVEL_32: LevelData = {
  id: 32,
  name: 'Triple Stack',
  minPlayers: 4,
  mapWidth: 1920,
  solidRects: [
    groundSegment(0, 1920),
    stackPlat,
    platformRect(950, FLOOR_TOP - 80, 96),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap32', 560, 80),
    floorButton('btn32', stackPlat.x + 64, 'door32', { latching: true }),
    fullHeightDoor('door32', 1350),
    floorButton('btn32b', 1450, 'door32', { latching: true }),
    goalOnFloor('goal32', 1870),
  ],
};
