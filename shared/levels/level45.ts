import { LevelData } from '../level';
import { FLOOR_TOP, STACK2_FEET_PEAK, STACK3_FEET_PEAK, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, fireBar, floorTrap, crumbleNoRespawn, lavaWall, pushBox, floorSpring, movingPlatform } from './_helpers';

const fW = 96;
const ferry = movingPlatform('plat45f', 1600, FLOOR_TOP - 96, fW, { axis: 'x', from: 1600+fW/2, to: 2200+fW/2, speed: 130 });
const highPlat   = platformRect(3400, STACK3_FEET_PEAK, 128);
const springPlat = platformRect(4200, 200, 128);

// L45 — "Final Legion" (Squad Legion)
// All mechanics, 5120 px, wall 80 px/s. Every button left of its door.
export const LEVEL_45: LevelData = {
  id: 45, name: 'Final Legion', minPlayers: 4, mapWidth: 5120,
  solidRects: [
    groundSegment(0, 320), groundSegment(1200, 450), groundSegment(2300, 400),
    groundSegment(3100, 2020), highPlat, springPlat,
    platformRect(1850, FLOOR_TOP - 80, 96),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall45', -64, 80),
    floorTrap('lava45a', 380, 812),
    crumbleNoRespawn('cnr45a', 320,  FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr45b', 448,  FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr45c', 576,  FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr45d', 704,  FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr45e', 832,  FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr45f', 960,  FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr45g', 1088, FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr45h', 1168, FLOOR_TOP - 32, 80),
    floorTrap('lava45b', 1700, 600),
    fireBar('fb45a', 1400, FLOOR_TOP - 48, 2, 1.1, 0),
    ferry,
    floorButton('btn45a', 1890, 'door45a', { latching: true }),
    fullHeightDoor('door45a', 2100),
    floorTrap('lava45c', 2380, 64),
    pushBox('box45a', 2200, FLOOR_TOP - 32),
    pushBox('box45b', 2430, FLOOR_TOP - 32),
    floorButton('btn45b', 2600, 'door45b', { latching: true }),
    floorButton('btn45c', 2800, 'door45b', { latching: true }),
    fullHeightDoor('door45b', 3000),
    floorButton('btn45stack', highPlat.x + 64, 'door45c', { latching: true }),
    fireBar('fb45b', 3600, FLOOR_TOP - 48, 3, -1.4, 90),
    floorButton('btn45d', 3900, 'door45c', { latching: true }),
    fullHeightDoor('door45c', 4100),
    floorSpring('spr45', 4200, 48),
    floorButton('btn45spr', springPlat.x + 64, 'door45d', { latching: true }),
    fullHeightDoor('door45d', 4600),
    goalOnFloor('goal45', 5040),
  ],
};
