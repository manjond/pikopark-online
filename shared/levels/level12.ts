import { LevelData } from '../level';
import {
  FLOOR_TOP, SOLO_FEET_PEAK,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorSpring,
} from './_helpers';

// Level 12 — "Spring High"  (Solo Master)
// Springs launch the player to platforms WAY above solo jump height.
// Gate is opened by pressing a button on a spring-only-reachable platform.

const highPlat = platformRect(640, 160, 128);   // y=160 — spring required

export const LEVEL_12: LevelData = {
  id: 12,
  name: 'Spring High',
  minPlayers: 1,
  mapWidth: 1440,
  solidRects: [
    groundSegment(0, 1440),
    highPlat,
    platformRect(900, FLOOR_TOP - 96, 96),   // step-down from high plat
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorSpring('spr12', 640, 48),             // spring under the high platform
    floorButton('btn12', 704, 'door12', { latching: true }),   // on high platform
    fullHeightDoor('door12', 1050),
    floorButton('btn12b', 1160, 'door12', { latching: true }),
    goalOnFloor('goal12', 1380),
  ],
};
