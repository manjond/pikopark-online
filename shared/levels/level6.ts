import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, crumblePlatform, floorTrap } from './_helpers';

// L6 — "Crumble Cross" (Solo Adept)
// Crumble platforms bridge a lava pit. ONE latching button on far side.
export const LEVEL_6: LevelData = {
  id: 6, name: 'Crumble Cross', minPlayers: 1, mapWidth: 1600,
  solidRects: [ groundSegment(0, 288), groundSegment(960, 640) ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('lava6', 376, 576),
    crumblePlatform('cr6a', 288, FLOOR_TOP - 32, 96),
    crumblePlatform('cr6b', 432, FLOOR_TOP - 32, 96),
    crumblePlatform('cr6c', 576, FLOOR_TOP - 32, 96),
    crumblePlatform('cr6d', 720, FLOOR_TOP - 32, 96),
    crumblePlatform('cr6e', 864, FLOOR_TOP - 32, 96),
    floorButton('btn6', 1010, 'door6', { latching: true }),
    fullHeightDoor('door6', 1160),
    goalOnFloor('goal6', 1500),
  ],
};
