import { LevelData } from '../level';
import { FLOOR_TOP, STACK3_FEET_PEAK, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorTrap, fireBar, lavaWall, crumbleNoRespawn, pushBox } from './_helpers';

const highStackPlat = platformRect(2700, STACK3_FEET_PEAK, 128);

// L40 — "Brigade Finale" (Squad Brigade)
// All mechanics. Lava zone trimmed so box-buttons are OUTSIDE it.
export const LEVEL_40: LevelData = {
  id: 40, name: 'Brigade Finale', minPlayers: 4, mapWidth: 4000,
  solidRects: [
    groundSegment(0, 320), groundSegment(900, 480), groundSegment(1700, 640),
    groundSegment(2650, 1350), highStackPlat,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall40', -64, 90),
    floorTrap('lava40a', 380, 516),
    crumbleNoRespawn('cnr40a', 320, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr40b', 464, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr40c', 608, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr40d', 752, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr40e', 848, FLOOR_TOP - 32, 96),
    floorTrap('lava40b', 1380, 64),
    fireBar('fb40a', 1200, FLOOR_TOP - 48, 2, 1.3, 0),
    floorTrap('lava40c', 1875, 350),          // covers x=1700-2050 — boxes start at 2100
    pushBox('box40a', 2100, FLOOR_TOP - 32),
    pushBox('box40b', 2220, FLOOR_TOP - 32),
    floorButton('btn40box1', 2300, 'door40a', { latching: true }),
    floorButton('btn40box2', 2450, 'door40a', { latching: true }),
    fullHeightDoor('door40a', 2600),
    floorButton('btn40stack', highStackPlat.x + 64, 'door40b', { latching: true }),
    fireBar('fb40b', 3000, FLOOR_TOP - 48, 3, -1.2, 60),
    floorButton('btn40b', 3300, 'door40b', { latching: true }),
    fullHeightDoor('door40b', 3500),
    goalOnFloor('goal40', 3920),
  ],
};
