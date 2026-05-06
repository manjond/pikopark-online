import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns } from './_helpers';

// L1 — "Welcome Gate" (Solo Cadet)
// Jump a pit, press ONE latching button, walk through door to exit.
// Single latching button = door stays open forever, no trapping.
export const LEVEL_1: LevelData = {
  id: 1, name: 'Welcome Gate', minPlayers: 1, mapWidth: 1600,
  solidRects: [
    groundSegment(0, 320),
    groundSegment(480, 1120),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('btn1', 700, 'door1', { latching: true }),
    fullHeightDoor('door1', 840),
    goalOnFloor('goal1', 1480),
  ],
};
