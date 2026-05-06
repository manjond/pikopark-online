import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorTrap } from './_helpers';

const p1 = platformRect(400,  FLOOR_TOP - 96, 96);
const p2 = platformRect(800,  FLOOR_TOP - 96, 96);
const p3 = platformRect(1200, FLOOR_TOP - 96, 96);
const p4 = platformRect(1600, FLOOR_TOP - 96, 96);

// L31 — "Four Posts" (Squad Crew)
// 4 latching buttons on platforms — one per player. ALL before door. FIXED.
export const LEVEL_31: LevelData = {
  id: 31, name: 'Four Posts', minPlayers: 4, mapWidth: 2400,
  solidRects: [ groundSegment(0, 2400), p1, p2, p3, p4 ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap31a', 380, 24),
    floorTrap('trap31b', 780, 24),
    floorTrap('trap31c', 1180, 24),
    floorTrap('trap31d', 1580, 24),
    floorButton('btn31a', 448,  'door31', { latching: true }),
    floorButton('btn31b', 848,  'door31', { latching: true }),
    floorButton('btn31c', 1248, 'door31', { latching: true }),
    floorButton('btn31d', 1648, 'door31', { latching: true }),
    fullHeightDoor('door31', 1950),
    goalOnFloor('goal31', 2350),
  ],
};
