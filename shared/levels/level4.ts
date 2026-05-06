import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorTrap,
} from './_helpers';

// Level 4 — "Two Keys"
// Solo. Two latching buttons must BOTH be pressed to open the door.
// Buttons are placed on separate platforms so the player must visit both.
// Floor has gaps under each platform (fall = death) to add tension.

const plat1 = platformRect(400, FLOOR_TOP - 144, 96);   // key platform 1
const plat2 = platformRect(700, FLOOR_TOP - 96,  96);   // key platform 2

export const LEVEL_4: LevelData = {
  id: 4,
  name: 'Two Keys',
  minPlayers: 1,
  mapWidth: 1440,
  solidRects: [
    groundSegment(0, 256),              // spawn ledge
    groundSegment(320, 256),            // mid section
    groundSegment(640, 256),            // second mid
    groundSegment(960, 480),            // finish section
    plat1, plat2,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap4a', 290, 24),       // edges of gaps are lava
    floorTrap('trap4b', 610, 24),
    floorTrap('trap4c', 930, 24),
    floorButton('btn4a', plat1.x + 48, 'door4', { latching: true }),
    floorButton('btn4b', plat2.x + 48, 'door4', { latching: true }),
    fullHeightDoor('door4', 1100),
    floorButton('btn4c', 1200, 'door4', { latching: true }),  // exit-side key
    goalOnFloor('goal4', 1360),
  ],
};
