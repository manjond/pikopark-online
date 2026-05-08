import { LevelData } from '../level';
import {
  FLOOR_TOP,
  fullHeightDoor,
  goalOnFloor,
  groundSegment,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

const upper1 = platformRect(260, FLOOR_TOP - 128, 160);
const upper2 = platformRect(520, FLOOR_TOP - 192, 160);
const keyPlatform = platformRect(780, FLOOR_TOP - 256, 192);

export const LEVEL_1: LevelData = {
  id: 1,
  name: 'Switchback Key',
  minPlayers: 1,
  mapWidth: 1800,
  solidRects: [
    groundSegment(0, 640),
    groundSegment(760, 1040),
    upper1,
    upper2,
    keyPlatform,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    platformButton('l1_key', keyPlatform, 'l1_door', { latching: true }),
    fullHeightDoor('l1_door', 1180),
    goalOnFloor('l1_goal', 1700),
  ],
};
