import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, floorTrap, fireBar, lavaWall, platformRect,
} from './_helpers';

// Level 13 — "Lava Chase + Fire"  (Solo Master)
// Lava wall at 120 px/s + two fire bars the player must dodge.
// Tight timing required. Map 3200 px wide.

const bypass = platformRect(960, FLOOR_TOP - 128, 128);

export const LEVEL_13: LevelData = {
  id: 13,
  name: 'Lava Chase & Fire',
  minPlayers: 1,
  mapWidth: 3200,
  solidRects: [
    groundSegment(0, 3200),
    bypass,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall13', -64, 120),
    floorTrap('trap13a', 480,  80),
    fireBar('fb13a',     700,  FLOOR_TOP - 48, 2, 1.4,   0),
    floorTrap('trap13b', 1200, 80),
    fireBar('fb13b',     1450, FLOOR_TOP - 48, 3, -1.1, 60),
    floorButton('btn13a', 1700, 'door13a', { latching: true }),
    fullHeightDoor('door13a', 1900),
    floorButton('btn13ab', 2000, 'door13a', { latching: true }),
    floorTrap('trap13c', 2300, 80),
    fireBar('fb13c', 2500, FLOOR_TOP - 48, 2, 1.6, 180),
    floorButton('btn13b', 2800, 'door13b', { latching: true }),
    fullHeightDoor('door13b', 3000),
    floorButton('btn13bb', 3080, 'door13b', { latching: true }),
    goalOnFloor('goal13', 3140),
  ],
};
