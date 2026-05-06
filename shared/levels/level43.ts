import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, floorTrap, fireBar, crumbleNoRespawn, lavaWall } from './_helpers';

// L43 — "No Way Back" (Squad Legion)
// All crumbles permanent + wall 88 px/s. Two buttons before one door.
export const LEVEL_43: LevelData = {
  id: 43, name: 'No Way Back', minPlayers: 4, mapWidth: 3600,
  solidRects: [ groundSegment(0, 320), groundSegment(1700, 400), groundSegment(2400, 1200) ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall43', -64, 88),
    floorTrap('lava43a', 420, 1282),
    crumbleNoRespawn('cnr43a', 400,  FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43b', 448,  FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43c', 576,  FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43d', 704,  FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43e', 832,  FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43f', 960,  FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43g', 1088, FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43h', 1216, FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43i', 1344, FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43j', 1472, FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43k', 1600, FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43l', 1680, FLOOR_TOP - 32, 80),
    floorButton('btn43a', 1780, 'door43', { latching: true }),
    fireBar('fb43', 2000, FLOOR_TOP - 48, 2, 1.2, 0),
    floorTrap('lava43b', 2400, 128),
    crumbleNoRespawn('cnr43m', 2400, FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43n', 2528, FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43o', 2656, FLOOR_TOP - 32, 80),
    floorButton('btn43b', 2900, 'door43', { latching: true }),
    fullHeightDoor('door43', 3100),
    goalOnFloor('goal43', 3520),
  ],
};
