import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, crumblePlatform, floorTrap } from './_helpers';

// L35 — "Pressure All" (Squad Crew)
// 4 LATCHING buttons — each player presses theirs, all 4 activate, door opens.
// Players can then freely walk to exit. Changed from pressure to latching so
// no one is stuck holding a button while everyone else has to cross.
export const LEVEL_35: LevelData = {
  id: 35, name: 'Pressure All', minPlayers: 4, mapWidth: 2000,
  solidRects: [ groundSegment(0, 2000) ],
  spawnPoints: standardSpawns(),
  objects: [
    crumblePlatform('cr35a', 600,  FLOOR_TOP - 32, 96),
    crumblePlatform('cr35b', 800,  FLOOR_TOP - 32, 96),
    crumblePlatform('cr35c', 1000, FLOOR_TOP - 32, 96),
    floorTrap('trap35a', 570, 24),
    floorTrap('trap35b', 770, 24),
    floorTrap('trap35c', 970, 24),
    floorButton('btn35a', 300,  'door35', { latching: true }),
    floorButton('btn35b', 450,  'door35', { latching: true }),
    floorButton('btn35c', 600,  'door35', { latching: true }),
    floorButton('btn35d', 750,  'door35', { latching: true }),
    fullHeightDoor('door35', 1300),
    goalOnFloor('goal35', 1920),
  ],
};
