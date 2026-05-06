import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, fireBar, floorTrap } from './_helpers';

// L37 — "Fire Maze" (Squad Brigade)
// 5 fire bars at staggered angles. Two latching buttons both LEFT of door.
export const LEVEL_37: LevelData = {
  id: 37, name: 'Fire Maze', minPlayers: 4, mapWidth: 2400,
  solidRects: [
    groundSegment(0, 2400),
    platformRect(400, FLOOR_TOP - 128, 96),
    platformRect(900, FLOOR_TOP - 128, 96),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    fireBar('fb37a', 380,  FLOOR_TOP - 48, 2,  1.0,   0),
    fireBar('fb37b', 640,  FLOOR_TOP - 48, 2, -1.2,  60),
    fireBar('fb37c', 900,  FLOOR_TOP - 48, 3,  1.4, 120),
    fireBar('fb37d', 1200, FLOOR_TOP - 48, 2, -0.9, 180),
    fireBar('fb37e', 1500, FLOOR_TOP - 48, 3,  1.6,  30),
    floorButton('btn37a', 1700, 'door37', { latching: true }),
    floorButton('btn37b', 1850, 'door37', { latching: true }),
    fullHeightDoor('door37', 2050),
    goalOnFloor('goal37', 2340),
  ],
};
