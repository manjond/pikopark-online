import { LevelData } from '../level';
import {
  FLOOR_TOP, STACK3_FEET_PEAK,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorTrap, fireBar, lavaWall,
  crumbleNoRespawn, pushBox,
} from './_helpers';

// Level 40 — "Brigade Finale"  (Squad Brigade)
// All brigade mechanics: wall, crumble, fire bars, boxes, split routes.
// Map 4000 px, wall 90 px/s.

const highStackPlat = platformRect(2700, STACK3_FEET_PEAK, 128);

export const LEVEL_40: LevelData = {
  id: 40,
  name: 'Brigade Finale',
  minPlayers: 4,
  mapWidth: 4000,
  solidRects: [
    groundSegment(0, 320),
    groundSegment(900, 480),
    groundSegment(1700, 640),
    groundSegment(2650, 1350),
    highStackPlat,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall40', -64, 90),
    floorTrap('lava40a', 320, 576),
    crumbleNoRespawn('cnr40a', 320, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr40b', 464, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr40c', 608, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr40d', 752, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr40e', 848, FLOOR_TOP - 32, 96),
    floorTrap('lava40b', 1380, 64),
    fireBar('fb40a', 1200, FLOOR_TOP - 48, 2, 1.3, 0),
    floorTrap('lava40c', 1700, 576),
    pushBox('box40a', 1600, FLOOR_TOP - 32),
    pushBox('box40b', 1800, FLOOR_TOP - 32),
    floorButton('btn40box1', 1950, 'door40a', { latching: false }),
    floorButton('btn40box2', 2150, 'door40a', { latching: false }),
    fullHeightDoor('door40a', 2400),
    floorButton('btn40a1', 2460, 'door40a', { latching: true }),
    floorButton('btn40stack', highStackPlat.x + 64, 'door40b', { latching: true }),
    fireBar('fb40b', 3000, FLOOR_TOP - 48, 3, -1.2, 60),
    floorButton('btn40b', 3300, 'door40b', { latching: true }),
    fullHeightDoor('door40b', 3500),
    floorButton('btn40ex', 3580, 'door40b', { latching: true }),
    goalOnFloor('goal40', 3920),
  ],
};
