import { LevelData } from '../level';
import {
  FLOOR_TOP,
  fireBar,
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  spikeTrap,
  standardSpawns,
} from './_helpers';

const crewStack = platformRect(820, FLOOR_TOP - 344, 176);
const highThrow = platformRect(1180, FLOOR_TOP - 344, 190);

export const LEVEL_41: LevelData = {
  id: 41,
  name: 'Citadel Bell',
  minPlayers: 4,
  mapWidth: 3000,
  solidRects: [
    groundRect(3000),
    crewStack,
    highThrow,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l41_crew_lock', 400, 'l41_door', {
      latching: true,
      requiredPlayers: 4,
      width: 176,
    }),
    platformButton('l41_stack_key', crewStack, 'l41_door', { latching: true }),
    platformButton('l41_throw_key', highThrow, 'l41_door', { latching: true }),
    spikeTrap('l41_spikes', 1540, FLOOR_TOP - 16, 96),
    fireBar('l41_fire', 1760, FLOOR_TOP - 72, 2, -1.25, 90),
    fullHeightDoor('l41_door', 2160),
    goalOnFloor('l41_goal', 2920),
  ],
};
