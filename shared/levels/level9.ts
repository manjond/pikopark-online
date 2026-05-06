import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, pushBox, floorTrap } from './_helpers';

const btnSlot = platformRect(800, FLOOR_TOP - 32, 96);

// L9 — "Box Job" (Solo Adept)
// Push the crate onto the pressure button — the box holds it so the player
// can walk through the door while the box keeps it open.
export const LEVEL_9: LevelData = {
  id: 9, name: 'Box Job', minPlayers: 1, mapWidth: 1440,
  solidRects: [ groundSegment(0, 1440), btnSlot ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap9', 450, 80),
    pushBox('box9', 300, FLOOR_TOP - 32),
    floorButton('btn9', btnSlot.x + 48, 'door9', { latching: true }),
    fullHeightDoor('door9', 1050),
    goalOnFloor('goal9', 1380),
  ],
};
