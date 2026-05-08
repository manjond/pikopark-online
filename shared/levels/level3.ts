import { LevelData } from '../level';
import {
  FLOOR_TOP,
  floorSpring,
  fullHeightDoor,
  goalOnFloor,
  groundSegment,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

const springLanding = platformRect(560, FLOOR_TOP - 368, 160);
const canalKey = platformRect(780, FLOOR_TOP - 368, 160);

export const LEVEL_3: LevelData = {
  id: 3,
  name: 'Spring Sluice',
  minPlayers: 1,
  mapWidth: 2100,
  solidRects: [
    groundSegment(0, 520),
    groundSegment(900, 1200),
    springLanding,
    canalKey,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorSpring('l3_spring', 430, 56),
    platformButton('l3_gate_key', canalKey, 'l3_door', { latching: true }),
    fullHeightDoor('l3_door', 1320),
    goalOnFloor('l3_goal', 2020),
  ],
};
