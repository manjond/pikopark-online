import { LevelData } from '../level';
import {
  FLOOR_TOP,
  fireBar,
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundSegment,
  platformButton,
  platformRect,
  standardSpawns,
  vine,
} from './_helpers';

const keyPlat = platformRect(950, FLOOR_TOP - 256, 176);

export const LEVEL_21: LevelData = {
  id: 21,
  name: 'Canopy Lock',
  minPlayers: 1,
  mapWidth: 2700,
  solidRects: [
    groundSegment(0, 520),
    groundSegment(760, 1940),
    keyPlat,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    vine('l21_vine', 640, FLOOR_TOP - 150, 190, 570),
    platformButton('l21_canopy_key', keyPlat, 'l21_door', { latching: true }),
    floorButton('l21_floor_key', 1220, 'l21_door', { latching: true }),
    fireBar('l21_fire', 1500, FLOOR_TOP - 72, 2, 1.4, 0),
    fullHeightDoor('l21_door', 1840),
    goalOnFloor('l21_goal', 2620),
  ],
};
