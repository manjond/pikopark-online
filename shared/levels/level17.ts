import { LevelData } from '../level';
import {
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 17 — "Hand Up"  (Pack: Duo Allies, 2 players)
// Introduces carry/throw. The button that opens the goal door sits on a
// platform too high for solo, too high for stack, too high for spring —
// it lives in the throw-only band (top y in [303, 357)). The carrier
// picks the partner up with E, walks to the launch spot, presses E again
// to throw upward. The thrown player lands on the perch and latches the
// button. The throw eats some momentum from the lava — pick the launch
// spot carefully.

const MAP_W = 1280;
const PERCH = platformRect(640, 320, 192); // throw-only (THROW_FEET_PEAK = 303)

export const LEVEL_17: LevelData = {
  id: 17,
  name: 'Hand Up',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), PERCH],
  spawnPoints: standardSpawns(),

  objects: [
    // Two short lava strips frame the launch zone — encourages a calm
    // pick-up rather than running through the throw.
    floorTrap('trap17a', 304, 96),
    floorTrap('trap17b', 896, 96),
    // Latching button on the perch — once pressed, the door stays open
    // and both players walk through to the goal.
    platformButton('btn17', PERCH, 'door17', { latching: true }),
    fullHeightDoor('door17', 1024),
    goalOnFloor('goal17', 1200),
  ],
};
