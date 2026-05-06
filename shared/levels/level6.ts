import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, crumblePlatform, floorTrap, groundRect,
} from './_helpers';

// Level 6 — "Crumble Cross"  (Solo Adept)
// Crumble platforms bridge a long lava pit. The player must cross carefully —
// each crumble shakes then falls, so don't linger! They do respawn after 3 s.
// Latching button on far side of pit opens door to exit.

export const LEVEL_6: LevelData = {
  id: 6,
  name: 'Crumble Cross',
  minPlayers: 1,
  mapWidth: 1600,
  solidRects: [
    groundSegment(0, 280),       // spawn ledge
    groundSegment(960, 640),     // far side + exit
  ],
  spawnPoints: standardSpawns(),
  objects: [
    // Lava fills the gap so falling = death
    floorTrap('lava6a', 376, 576),
    // Crumble bridges
    crumblePlatform('cr6a', 288,  FLOOR_TOP - 32, 96),
    crumblePlatform('cr6b', 432,  FLOOR_TOP - 32, 96),
    crumblePlatform('cr6c', 576,  FLOOR_TOP - 32, 96),
    crumblePlatform('cr6d', 720,  FLOOR_TOP - 32, 96),
    crumblePlatform('cr6e', 864,  FLOOR_TOP - 32, 96),
    // Latching button on far side
    floorButton('btn6', 1000, 'door6', { latching: true }),
    fullHeightDoor('door6', 1150),
    floorButton('btn6b', 1260, 'door6', { latching: true }),
    goalOnFloor('goal6', 1500),
  ],
};
