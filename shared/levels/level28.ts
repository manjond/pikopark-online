import { LevelData } from '../level';
import {
  fireBar,
  floorButton,
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 28 — "Throw of Faith"  (Pack: Duo Trust, 2 players)
// One pure throw, one partner stranded, no shortcuts. The chasm in the
// middle is wider than any solo or stacked jump (480 px). The carrier
// commits a single throw to launch their partner onto the throw-only
// perch on the far side. The partner drops down, threads two firebars
// over a short lava strip, slaps the latching switch, and walks to the
// goal. The carrier stays behind on the spawn rim — only one player
// needs to touch the goal for the room to complete.

const MAP_W = 1920;
const PERCH = platformRect(640, 320, 192); // throw-only target

export const LEVEL_28: LevelData = {
  id: 28,
  name: 'Throw of Faith',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), PERCH],
  spawnPoints: standardSpawns(),

  objects: [
    // Chasm — too wide for any normal jump.
    floorTrap('trap28chasm', 528, 480),
    // Lava strip past the perch — short, jumpable; firebars overhead.
    floorTrap('trap28strip', 1248, 192),
    fireBar('fb28a', 1152, 460, 2,  1.6, 0),
    fireBar('fb28b', 1344, 460, 2, -1.6, 90),
    // Token "perch latch" — pressing it on the way over the perch is
    // optional but reminds the partner to commit to the path before
    // dropping.
    platformButton('btn28perch', PERCH, 'door28perch', { latching: true }),
    fullHeightDoor('door28perch', 880),
    // Latching switch on the floor between the firebars and the goal.
    floorButton('btn28latch', 1568, 'door28goal', { latching: true }),
    fullHeightDoor('door28goal', 1728),
    goalOnFloor('goal28', 1856),
  ],
};
