import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, floorTrap, crumblePlatform,
} from './_helpers';

// Level 35 — "Pressure All"  (Squad Crew)
// Four simultaneous pressure buttons (requiredPlayers:1 each) all linked to
// one door. ALL four must be held at the same time. Latching button far side.

export const LEVEL_35: LevelData = {
  id: 35,
  name: 'Pressure All',
  minPlayers: 4,
  mapWidth: 2000,
  solidRects: [
    groundSegment(0, 2000),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    // Crumble platforms add routing variety between buttons
    crumblePlatform('cr35a', 600,  FLOOR_TOP - 32, 96),
    crumblePlatform('cr35b', 800,  FLOOR_TOP - 32, 96),
    crumblePlatform('cr35c', 1000, FLOOR_TOP - 32, 96),
    floorTrap('trap35a', 570, 24),
    floorTrap('trap35b', 770, 24),
    floorTrap('trap35c', 970, 24),
    // Four pressure buttons — all must be active simultaneously
    floorButton('btn35a', 300,  'door35', { latching: false, requiredPlayers: 1 }),
    floorButton('btn35b', 450,  'door35', { latching: false, requiredPlayers: 1 }),
    floorButton('btn35c', 600,  'door35', { latching: false, requiredPlayers: 1 }),
    floorButton('btn35d', 750,  'door35', { latching: false, requiredPlayers: 1 }),
    fullHeightDoor('door35', 1300),
    floorButton('btn35ex', 1410, 'door35', { latching: true }),
    goalOnFloor('goal35', 1920),
  ],
};
