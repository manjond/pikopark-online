import { LevelData } from '../level';
import {
  FLOOR_TOP,
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundSegment,
  standardSpawns,
  vine,
} from './_helpers';

export const LEVEL_16: LevelData = {
  id: 16,
  name: 'Vine Gap',
  minPlayers: 1,
  mapWidth: 2000,
  solidRects: [
    groundSegment(0, 500),
    groundSegment(780, 1220),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    vine('l16_vine', 630, FLOOR_TOP - 138, 180, 560),
    floorButton('l16_gate_key', 900, 'l16_door', { latching: true }),
    fullHeightDoor('l16_door', 1320),
    goalOnFloor('l16_goal', 1920),
  ],
};
