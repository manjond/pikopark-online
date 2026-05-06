import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorTrap,
} from './_helpers';

// Level 31 — "Four Posts"  (Squad Crew)
// Four latching buttons spread across the map — one for each player.
// All four must be pressed before any door opens.

export const LEVEL_31: LevelData = {
  id: 31,
  name: 'Four Posts',
  minPlayers: 4,
  mapWidth: 2400,
  solidRects: [
    groundSegment(0, 2400),
    platformRect(400,  FLOOR_TOP - 96, 96),
    platformRect(800,  FLOOR_TOP - 96, 96),
    platformRect(1200, FLOOR_TOP - 96, 96),
    platformRect(1600, FLOOR_TOP - 96, 96),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap31a', 350, 24),
    floorTrap('trap31b', 750, 24),
    floorTrap('trap31c', 1150, 24),
    floorTrap('trap31d', 1550, 24),
    floorButton('btn31a', 448,  'door31', { latching: true }),
    floorButton('btn31b', 848,  'door31', { latching: true }),
    floorButton('btn31c', 1248, 'door31', { latching: true }),
    floorButton('btn31d', 1648, 'door31', { latching: true }),
    fullHeightDoor('door31', 1950),
    floorButton('btn31ex', 2050, 'door31', { latching: true }),
    goalOnFloor('goal31', 2350),
  ],
};
