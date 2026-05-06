import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorTrap, fireBar,
} from './_helpers';

// Level 7 — "Fire Alley"  (Solo Adept)
// Three rotating fire bars guard the path. Time the gaps between sweeps.
// Platforms above give alternate routes past the first two bars.

const plat1 = platformRect(480, FLOOR_TOP - 128, 96);
const plat2 = platformRect(800, FLOOR_TOP - 128, 96);

export const LEVEL_7: LevelData = {
  id: 7,
  name: 'Fire Alley',
  minPlayers: 1,
  mapWidth: 1600,
  solidRects: [
    groundSegment(0, 1600),
    plat1, plat2,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    // Three fire bars at intervals — stagger starting angles so there's always a gap
    fireBar('fb7a', 400,  FLOOR_TOP - 32, 2, 1.2,   0),
    fireBar('fb7b', 720,  FLOOR_TOP - 32, 2, -1.0,  90),
    fireBar('fb7c', 1040, FLOOR_TOP - 32, 2,  1.5, 180),
    // Latching button past the last bar
    floorButton('btn7', 1180, 'door7', { latching: true }),
    fullHeightDoor('door7', 1330),
    floorButton('btn7b', 1440, 'door7', { latching: true }),
    goalOnFloor('goal7', 1540),
  ],
};
