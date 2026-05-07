import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, platformButton, fullHeightDoor, standardSpawns, platformRect, floorTrap } from './_helpers';

const platA = platformRect(480, FLOOR_TOP - 128, 96);
const platB = platformRect(1000, FLOOR_TOP - 128, 96);

// L22 — "High Five" (Duo Synergy)
// Buttons ON top of elevated platforms (platformButton, not floorButton).
// Lava pits are BETWEEN the platforms so jumping to each platform is the challenge.
// No lava under the button positions.
export const LEVEL_22: LevelData = {
  id: 22, name: 'High Five', minPlayers: 2, mapWidth: 2000,
  solidRects: [ groundSegment(0, 2000), platA, platB ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap22a', 600, 64),          // lava between spawn and platA (clear of platA x=480-576)
    floorTrap('trap22b', 1150, 64),         // lava between platA and platB (clear of platB x=1000-1096)
    platformButton('btn22a', platA, 'door22a', { latching: true }),
    platformButton('btn22b', platB, 'door22b', { latching: true }),
    fullHeightDoor('door22a', 700),
    fullHeightDoor('door22b', 1200),
    goalOnFloor('goal22', 1900),
  ],
};
