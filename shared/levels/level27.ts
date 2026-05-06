import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorSpring, floorTrap,
} from './_helpers';

// Level 27 — "Spring Launch"  (Duo Trust)
// One player stands on a platform and acts as a "launchpad" for the other
// (stack then jump). The high platform has the key button.
// Also: spring pad to help solo navigation.

const highPlat = platformRect(700, 180, 128);   // y=180, spring required

export const LEVEL_27: LevelData = {
  id: 27,
  name: 'Spring Launch',
  minPlayers: 2,
  mapWidth: 1920,
  solidRects: [
    groundSegment(0, 1920),
    highPlat,
    platformRect(1000, FLOOR_TOP - 96, 96),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap27', 560, 80),
    floorSpring('spr27', 700, 48),
    floorButton('btn27', highPlat.x + 64, 'door27', { latching: true }),
    fullHeightDoor('door27', 1350),
    floorButton('btn27b', 1450, 'door27', { latching: true }),
    goalOnFloor('goal27', 1870),
  ],
};
