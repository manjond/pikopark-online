import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorTrap, lavaWall } from './_helpers';

const topPath = platformRect(800, FLOOR_TOP - 160, 480);

// L24 — "Lava Dash Duo" (Duo Synergy)
// Wall 110 px/s. Two buttons (upper path + lower path) both LEFT of door.
export const LEVEL_24: LevelData = {
  id: 24, name: 'Lava Dash Duo', minPlayers: 2, mapWidth: 2800,
  solidRects: [ groundSegment(0, 2800), topPath ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall24', -64, 110),
    floorTrap('trap24a', 500, 80),
    floorButton('btn24up', topPath.x + topPath.width / 2, 'door24', { latching: true }),
    floorButton('btn24dn', 1400, 'door24', { latching: true }),
    floorTrap('trap24b', 1600, 96),
    fullHeightDoor('door24', 2100),
    goalOnFloor('goal24', 2720),
  ],
};
