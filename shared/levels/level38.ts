import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, crumbleNoRespawn, floorTrap, lavaWall,
} from './_helpers';

// Level 38 — "Crumble Rush"  (Squad Brigade)
// Non-respawning crumble bridges + lava wall. 4 players must cross carefully —
// they have 12 crumble platforms bridging two lava pits and cannot go back.

export const LEVEL_38: LevelData = {
  id: 38,
  name: 'Crumble Rush',
  minPlayers: 4,
  mapWidth: 3200,
  solidRects: [
    groundSegment(0, 256),
    groundSegment(1200, 400),
    groundSegment(2200, 1000),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall38', -64, 90),
    floorTrap('lava38a', 258, 940),
    crumbleNoRespawn('cnr38a', 256,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr38b', 400,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr38c', 544,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr38d', 688,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr38e', 832,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr38f', 976,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr38g', 1120, FLOOR_TOP - 32, 96),
    floorTrap('lava38b', 1600, 600),
    crumbleNoRespawn('cnr38h', 1600, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr38i', 1744, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr38j', 1888, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr38k', 2032, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr38l', 2150, FLOOR_TOP - 32, 96),
    floorButton('btn38', 2300, 'door38', { latching: true }),
    fullHeightDoor('door38', 2600),
    floorButton('btn38b', 2710, 'door38', { latching: true }),
    goalOnFloor('goal38', 3100),
  ],
};
