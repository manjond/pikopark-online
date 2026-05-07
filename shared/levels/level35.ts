import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, crumblePlatform, floorTrap } from './_helpers';

// L35 — "Pressure All" (Squad Crew)
// 4 latching buttons — all at safe positions (lava traps between buttons, not on them).
export const LEVEL_35: LevelData = {
  id: 35, name: 'Pressure All', minPlayers: 4, mapWidth: 2000,
  solidRects: [ groundSegment(0, 2000) ],
  spawnPoints: standardSpawns(),
  objects: [
    crumblePlatform('cr35a', 640,  FLOOR_TOP - 32, 80),
    crumblePlatform('cr35b', 840,  FLOOR_TOP - 32, 80),
    crumblePlatform('cr35c', 1040, FLOOR_TOP - 32, 80),
    // Lava traps: positioned BETWEEN button slots (not on them)
    floorTrap('trap35a', 527, 24),    // x=515-539  (between btn@350-btn@600)
    floorTrap('trap35b', 727, 24),    // x=715-739  (between btn@600-btn@750)
    floorTrap('trap35c', 910, 24),    // x=898-922  (between btn@750-btn@1050)
    floorButton('btn35a', 300,  'door35', { latching: true }),
    floorButton('btn35b', 450,  'door35', { latching: true }),
    floorButton('btn35c', 650,  'door35', { latching: true }),   // moved from 600
    floorButton('btn35d', 800,  'door35', { latching: true }),   // moved from 750
    fullHeightDoor('door35', 1300),
    goalOnFloor('goal35', 1920),
  ],
};
