import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, crumbleNoRespawn, floorTrap,
} from './_helpers';

// Level 11 — "No Way Back"  (Solo Master)
// Crumble platforms that do NOT respawn. Once a platform falls, that path
// is gone forever. The player must plan their crossing carefully.
// Six non-respawn crumble bridges span a wide lava pit.

export const LEVEL_11: LevelData = {
  id: 11,
  name: 'No Way Back',
  minPlayers: 1,
  mapWidth: 1600,
  solidRects: [
    groundSegment(0,    256),   // spawn
    groundSegment(1100, 500),   // far side
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('lava11', 290, 800),                         // wide lava pit
    crumbleNoRespawn('cnr11a', 256,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr11b', 400,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr11c', 544,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr11d', 688,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr11e', 832,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr11f', 976,  FLOOR_TOP - 32, 96),
    floorButton('btn11', 1150, 'door11', { latching: true }),
    fullHeightDoor('door11', 1300),
    floorButton('btn11b', 1410, 'door11', { latching: true }),
    goalOnFloor('goal11', 1530),
  ],
};
