import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, lavaWall, floorTrap, fireBar } from './_helpers';

const bypass = platformRect(880, FLOOR_TOP - 128, 128);

// L10 — "Speed Run" (Solo Adept)
// Lava wall 110 px/s. Two latching buttons to unlock two doors. Run!
export const LEVEL_10: LevelData = {
  id: 10, name: 'Speed Run', minPlayers: 1, mapWidth: 2800,
  solidRects: [ groundSegment(0, 2800), bypass ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall10', -64, 110),
    floorTrap('trap10a', 560, 80),
    fireBar('fb10', 760, FLOOR_TOP - 48, 2, 1.3, 45),
    floorButton('btn10a', 1100, 'door10a', { latching: true }),
    fullHeightDoor('door10a', 1300),
    floorTrap('trap10b', 1600, 96),
    floorButton('btn10b', 1900, 'door10b', { latching: true }),
    fullHeightDoor('door10b', 2100),
    goalOnFloor('goal10', 2700),
  ],
};
