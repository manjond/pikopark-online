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

const crewStack = platformRect(780, FLOOR_TOP - 344, 176);

export const LEVEL_36: LevelData = {
  id: 36,
  name: 'Brigade Spike Drill',
  minPlayers: 4,
  mapWidth: 2400,
  solidRects: [
    groundRect(2400),
    crewStack,
    platformRect(1120, FLOOR_TOP - 128, 128),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l36_crew_lock', 380, 'l36_door', {
      latching: true,
      requiredPlayers: 4,
      width: 176,
    }),
    platformButton('l36_stack_key', crewStack, 'l36_door', { latching: true }),
    spikeTrap('l36_spikes_a', 1250, FLOOR_TOP - 16, 112),
    fireBar('l36_fire', 1480, FLOOR_TOP - 72, 2, 1.25, 45),
    fullHeightDoor('l36_door', 1760),
    goalOnFloor('l36_goal', 2320),
  ],
};
