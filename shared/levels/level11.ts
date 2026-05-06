import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, crumbleNoRespawn, floorTrap } from './_helpers';

// L11 — "No Way Back" (Solo Master)
// Non-respawn crumbles. Once fallen = permanent gap. Plan carefully.
export const LEVEL_11: LevelData = {
  id: 11, name: 'No Way Back', minPlayers: 1, mapWidth: 1600,
  solidRects: [ groundSegment(0, 320), groundSegment(1100, 500) ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('lava11', 420, 640),
    crumbleNoRespawn('cnr11a', 400,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr11b', 464,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr11c', 608,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr11d', 752,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr11e', 896,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr11f', 1040, FLOOR_TOP - 32, 96),
    floorButton('btn11', 1160, 'door11', { latching: true }),
    fullHeightDoor('door11', 1300),
    goalOnFloor('goal11', 1530),
  ],
};
