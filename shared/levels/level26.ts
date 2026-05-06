import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, crumbleNoRespawn, floorTrap, lavaWall } from './_helpers';

// L26 — "Bridge Drop" (Duo Trust)
// Non-respawn crumbles + lava wall 95 px/s. Decide your path wisely.
export const LEVEL_26: LevelData = {
  id: 26, name: 'Bridge Drop', minPlayers: 2, mapWidth: 2800,
  solidRects: [ groundSegment(0, 320), groundSegment(1200, 1600) ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall26', -64, 95),
    floorTrap('lava26a', 420, 780),
    crumbleNoRespawn('cnr26a', 400,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr26b', 464,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr26c', 608,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr26d', 752,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr26e', 896,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr26f', 1040, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr26g', 1150, FLOOR_TOP - 32, 96),
    floorButton('btn26', 1280, 'door26', { latching: true }),
    fullHeightDoor('door26', 1600),
    goalOnFloor('goal26', 2720),
  ],
};
