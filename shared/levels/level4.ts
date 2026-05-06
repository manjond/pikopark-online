import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorTrap } from './_helpers';

const plat1 = platformRect(440, FLOOR_TOP - 144, 96);
const plat2 = platformRect(720, FLOOR_TOP - 96,  96);

// L4 — "Two Keys" (Solo Cadet)
// BOTH latching buttons must be pressed (on separate platforms) before door opens.
// Both are LEFT of the door — no deadlock. Gaps are pits for tension.
export const LEVEL_4: LevelData = {
  id: 4, name: 'Two Keys', minPlayers: 1, mapWidth: 1440,
  solidRects: [
    groundSegment(0, 280), groundSegment(380, 256), groundSegment(680, 256), groundSegment(980, 460),
    plat1, plat2,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('trap4a', 400, 24), floorTrap('trap4b', 641, 24), floorTrap('trap4c', 943, 24),
    floorButton('btn4a', plat1.x + 48, 'door4', { latching: true }),
    floorButton('btn4b', plat2.x + 48, 'door4', { latching: true }),
    fullHeightDoor('door4', 1100),
    goalOnFloor('goal4', 1360),
  ],
};
