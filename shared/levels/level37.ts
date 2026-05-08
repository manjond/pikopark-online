import { LevelData } from '../level';
import {
  FLOOR_TOP,
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundSegment,
  platformButton,
  platformRect,
  standardSpawns,
  vine,
} from './_helpers';

const crewStack = platformRect(1180, FLOOR_TOP - 344, 176);

export const LEVEL_37: LevelData = {
  id: 37,
  name: 'Four Swing Relay',
  minPlayers: 4,
  mapWidth: 2800,
  solidRects: [
    groundSegment(0, 600),
    groundSegment(900, 1900),
    crewStack,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l37_crew_lock', 360, 'l37_door', {
      latching: true,
      requiredPlayers: 4,
      width: 176,
    }),
    vine('l37_vine', 750, FLOOR_TOP - 150, 190, 570),
    platformButton('l37_stack_key', crewStack, 'l37_door', { latching: true }),
    fullHeightDoor('l37_door', 1900),
    goalOnFloor('l37_goal', 2720),
  ],
};
