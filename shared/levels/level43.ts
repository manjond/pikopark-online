import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, floorTrap, fireBar, crumbleNoRespawn, pushBox,
  lavaWall, platformRect,
} from './_helpers';

// Level 43 — "No Way Back"  (Squad Legion)
// ALL crumble platforms are non-respawn. Every step is permanent.
// + Lava wall to add time pressure. 4 players must cross carefully.

export const LEVEL_43: LevelData = {
  id: 43,
  name: 'No Way Back',
  minPlayers: 4,
  mapWidth: 3600,
  solidRects: [
    groundSegment(0, 256),
    groundSegment(1700, 400),
    groundSegment(2400, 1200),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall43', -64, 88),
    floorTrap('lava43a', 258, 1438),
    crumbleNoRespawn('cnr43a', 256,  FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43b', 384,  FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43c', 512,  FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43d', 640,  FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43e', 768,  FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43f', 896,  FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43g', 1024, FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43h', 1152, FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43i', 1280, FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43j', 1408, FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43k', 1568, FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43l', 1650, FLOOR_TOP - 32, 80),
    floorButton('btn43a', 1780, 'door43', { latching: true }),
    fireBar('fb43', 2000, FLOOR_TOP - 48, 2, 1.2, 0),
    floorTrap('lava43b', 2400, 128),
    crumbleNoRespawn('cnr43m', 2400, FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43n', 2528, FLOOR_TOP - 32, 80),
    crumbleNoRespawn('cnr43o', 2656, FLOOR_TOP - 32, 80),
    floorButton('btn43b', 2900, 'door43', { latching: true }),
    fullHeightDoor('door43', 3100),
    floorButton('btn43ex', 3200, 'door43', { latching: true }),
    goalOnFloor('goal43', 3520),
  ],
};
