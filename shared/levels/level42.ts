import { LevelData } from '../level';
import { FLOOR_TOP, STACK3_FEET_PEAK, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, fireBar, floorTrap, lavaWall, crumbleNoRespawn } from './_helpers';

const highPlat = platformRect(3200, STACK3_FEET_PEAK, 128);

// L42 — "Full House" (Squad Legion)
// All mechanics. All buttons left of their doors.
export const LEVEL_42: LevelData = {
  id: 42, name: 'Full House', minPlayers: 4, mapWidth: 4000,
  solidRects: [
    groundSegment(0, 320), groundSegment(900, 400), groundSegment(1600, 400),
    groundSegment(2400, 1600), highPlat,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall42', -64, 85),
    floorTrap('lava42a', 380, 516),
    crumbleNoRespawn('cnr42a', 320, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr42b', 464, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr42c', 608, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr42d', 752, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr42e', 848, FLOOR_TOP - 32, 96),
    fireBar('fb42a', 1200, FLOOR_TOP - 48, 2, 1.2, 0),
    floorButton('btn42a', 800,  'door42a', { latching: true }),
    floorButton('btn42b', 1100, 'door42a', { latching: true }),
    fullHeightDoor('door42a', 1300),
    floorTrap('lava42b', 1660, 516),
    crumbleNoRespawn('cnr42f', 1600, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr42g', 1744, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr42h', 1888, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr42i', 2032, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr42j', 2176, FLOOR_TOP - 32, 96),
    floorButton('btn42stack', highPlat.x + 64, 'door42b', { latching: true }),
    fireBar('fb42b', 3000, FLOOR_TOP - 48, 3, -1.3, 60),
    floorButton('btn42c', 3300, 'door42b', { latching: true }),
    floorButton('btn42d', 3500, 'door42b', { latching: true }),
    fullHeightDoor('door42b', 3700),
    goalOnFloor('goal42', 3920),
  ],
};
