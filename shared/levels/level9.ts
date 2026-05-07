import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, pushBox, floorTrap } from './_helpers';

// L9 — "Box Job" (Solo Adept)
// Push the crate onto the PRESSURE button. The box's weight holds the button
// so the door stays open — player walks through while box keeps it pressed.
// Pressure button: turns off if box moves away. Box must stay in place.
export const LEVEL_9: LevelData = {
  id: 9, name: 'Box Job', minPlayers: 1, mapWidth: 1440,
  solidRects: [ groundSegment(0, 1440) ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap9', 450, 80),
    pushBox('box9', 300, FLOOR_TOP - 32),
    // Pressure button: latching=false so box must stay on it to keep door open
    floorButton('btn9', 820, 'door9', { latching: false }),
    fullHeightDoor('door9', 1050),
    goalOnFloor('goal9', 1380),
  ],
};
