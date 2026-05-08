import { LevelData } from '../level';
import {
  FLOOR_TOP,
  crumblePlatform,
  fireBar,
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundSegment,
  movingPlatform,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

const crewStack = platformRect(740, FLOOR_TOP - 344, 176);

export const LEVEL_39: LevelData = {
  id: 39,
  name: 'Crumble Brigade',
  minPlayers: 4,
  mapWidth: 3200,
  solidRects: [
    groundSegment(0, 700),
    groundSegment(1280, 1920),
    crewStack,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l39_crew_lock', 360, 'l39_door', {
      latching: true,
      requiredPlayers: 4,
      width: 176,
    }),
    platformButton('l39_stack_key', crewStack, 'l39_door', { latching: true }),
    crumblePlatform('l39_c1', 760, FLOOR_TOP - 96, 96),
    crumblePlatform('l39_c2', 900, FLOOR_TOP - 96, 96),
    crumblePlatform('l39_c3', 1040, FLOOR_TOP - 96, 96),
    movingPlatform('l39_ferry', 1706, FLOOR_TOP - 128, 128, {
      axis: 'x',
      from: 1770,
      to: 1980,
      speed: 120,
    }),
    fireBar('l39_fire', 2180, FLOOR_TOP - 72, 2, -1.3, 90),
    fullHeightDoor('l39_door', 2500),
    goalOnFloor('l39_goal', 3120),
  ],
};
