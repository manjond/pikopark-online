import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorTrap, fireBar } from './_helpers';

// L23 — "Tag Team" (Duo Synergy)
// Pressure button deactivates lava (lets partner sprint past firebar).
// After the sprint, partner presses latching button to open exit door.
// Pressure btn → trap (deactivate lava). Latching btn → door. No deadlock.
export const LEVEL_23: LevelData = {
  id: 23, name: 'Tag Team', minPlayers: 2, mapWidth: 1920,
  solidRects: [ groundSegment(0, 1920), platformRect(400, FLOOR_TOP - 96, 96) ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('btn23pause', 430, 'trap23', { latching: false, requiredPlayers: 1 }),
    floorTrap('trap23', 820, 128),
    fireBar('fb23', 900, FLOOR_TOP - 48, 2, 1.1, 0),
    floorTrap('trap23b', 1120, 64),
    floorButton('btn23latch', 1250, 'door23', { latching: true }),
    fullHeightDoor('door23', 1450),
    goalOnFloor('goal23', 1880),
  ],
};
