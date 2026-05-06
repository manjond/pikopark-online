import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, crumbleNoRespawn, floorTrap, lavaWall,
} from './_helpers';

// Level 26 — "Bridge Drop"  (Duo Trust)
// Non-respawning crumble bridges over wide lava + lava wall chasing.
// Both players must cross simultaneously — once a platform falls, that
// tile is gone. Plan your route, trust your partner.

export const LEVEL_26: LevelData = {
  id: 26,
  name: 'Bridge Drop',
  minPlayers: 2,
  mapWidth: 2800,
  solidRects: [
    groundSegment(0, 256),
    groundSegment(1200, 1600),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall26', -64, 95),
    floorTrap('lava26a', 258, 938),
    crumbleNoRespawn('cnr26a', 256,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr26b', 400,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr26c', 544,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr26d', 688,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr26e', 832,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr26f', 976,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr26g', 1100, FLOOR_TOP - 32, 96),
    floorButton('btn26', 1280, 'door26', { latching: true }),
    fullHeightDoor('door26', 1600),
    floorButton('btn26b', 1710, 'door26', { latching: true }),
    goalOnFloor('goal26', 2720),
  ],
};
