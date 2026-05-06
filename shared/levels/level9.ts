import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorTrap, pushBox,
} from './_helpers';

// Level 9 — "Box Job"  (Solo Adept)
// First pushable-box level. A pressure button requires the crate to be pushed
// onto it to open the door. The button stays active as long as the box is on it.
// The player can then walk through while the box holds the button.

const btnPlatform = platformRect(800, FLOOR_TOP - 32, 96);  // button sits here

export const LEVEL_9: LevelData = {
  id: 9,
  name: 'Box Job',
  minPlayers: 1,
  mapWidth: 1440,
  solidRects: [
    groundSegment(0, 1440),
    btnPlatform,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    // The crate starts next to a lava strip — player must push it right
    floorTrap('trap9', 480, 80),
    pushBox('box9', 300, FLOOR_TOP - 32),
    // Pressure button: box resting on the platform top activates it
    floorButton('btn9', btnPlatform.x + 48, 'door9', { latching: false }),
    fullHeightDoor('door9', 1050),
    // Latching button on exit side so player doesn't need to carry box back
    floorButton('btn9b', 1150, 'door9', { latching: true }),
    goalOnFloor('goal9', 1380),
  ],
};
