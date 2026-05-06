import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, crumbleNoRespawn, floorTrap, lavaWall } from './_helpers';

// L38 — "Crumble Rush" (Squad Brigade)
// Non-respawn crumbles + wall 90 px/s. ONE latching button left of door.
export const LEVEL_38: LevelData = {
  id: 38, name: 'Crumble Rush', minPlayers: 4, mapWidth: 3200,
  solidRects: [ groundSegment(0, 320), groundSegment(1200, 400), groundSegment(2200, 1000) ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall38', -64, 90),
    floorTrap('lava38a', 420, 784),
    crumbleNoRespawn('cnr38a', 400,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr38b', 464,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr38c', 608,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr38d', 752,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr38e', 896,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr38f', 1040, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr38g', 1152, FLOOR_TOP - 32, 96),
    floorTrap('lava38b', 1600, 600),
    crumbleNoRespawn('cnr38h', 1600, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr38i', 1744, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr38j', 1888, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr38k', 2032, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr38l', 2150, FLOOR_TOP - 32, 96),
    floorButton('btn38', 2300, 'door38', { latching: true }),
    fullHeightDoor('door38', 2600),
    goalOnFloor('goal38', 3100),
  ],
};
