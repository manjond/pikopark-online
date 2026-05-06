import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, crumblePlatform, floorTrap } from './_helpers';

// L21 — "Double Cross" (Duo Synergy)
// Two crumble bridges. Press latching button on far side, walk to exit.
export const LEVEL_21: LevelData = {
  id: 21, name: 'Double Cross', minPlayers: 2, mapWidth: 2000,
  solidRects: [ groundSegment(0, 320), groundSegment(780, 280), groundSegment(1440, 560) ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('lava21a', 420, 360),
    crumblePlatform('cr21a', 400, FLOOR_TOP - 32, 96),
    crumblePlatform('cr21b', 464, FLOOR_TOP - 32, 96),
    crumblePlatform('cr21c', 608, FLOOR_TOP - 32, 96),
    crumblePlatform('cr21d', 720, FLOOR_TOP - 32, 96),
    floorTrap('lava21b', 1060, 374),
    crumblePlatform('cr21e', 1060, FLOOR_TOP - 32, 96),
    crumblePlatform('cr21f', 1204, FLOOR_TOP - 32, 96),
    crumblePlatform('cr21g', 1348, FLOOR_TOP - 32, 96),
    floorButton('btn21', 1500, 'door21', { latching: true }),
    fullHeightDoor('door21', 1700),
    goalOnFloor('goal21', 1940),
  ],
};
