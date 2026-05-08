import { LevelData } from '../level';
import {
  FLOOR_TOP,
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundSegment,
  movingPlatform,
  platformButton,
  platformRect,
  standardSpawns,
  vine,
} from './_helpers';

const crewStack = platformRect(1220, FLOOR_TOP - 344, 176);

export const LEVEL_42: LevelData = {
  id: 42,
  name: 'Canopy Citadel',
  minPlayers: 4,
  mapWidth: 3400,
  solidRects: [
    groundSegment(0, 560),
    groundSegment(880, 820),
    groundSegment(2160, 1240),
    crewStack,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l42_crew_lock', 340, 'l42_door', {
      latching: true,
      requiredPlayers: 4,
      width: 176,
    }),
    vine('l42_vine_a', 720, FLOOR_TOP - 150, 190, 560),
    platformButton('l42_stack_key', crewStack, 'l42_door', { latching: true }),
    movingPlatform('l42_ferry', 1726, FLOOR_TOP - 128, 128, {
      axis: 'x',
      from: 1790,
      to: 2100,
      speed: 125,
    }),
    fullHeightDoor('l42_door', 2620),
    goalOnFloor('l42_goal', 3320),
  ],
};
