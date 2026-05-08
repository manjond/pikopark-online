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
  spikeTrap,
  standardSpawns,
  vine,
} from './_helpers';

const crewStack = platformRect(980, FLOOR_TOP - 344, 176);

export const LEVEL_44: LevelData = {
  id: 44,
  name: 'Citadel Relay',
  minPlayers: 4,
  mapWidth: 4000,
  solidRects: [
    groundSegment(0, 620),
    groundSegment(980, 900),
    groundSegment(2300, 1700),
    crewStack,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l44_crew_lock', 360, 'l44_door', {
      latching: true,
      requiredPlayers: 4,
      width: 176,
    }),
    vine('l44_vine_a', 780, FLOOR_TOP - 150, 190, 560),
    platformButton('l44_stack_key', crewStack, 'l44_door', { latching: true }),
    movingPlatform('l44_ferry', 1906, FLOOR_TOP - 128, 128, {
      axis: 'x',
      from: 1970,
      to: 2240,
      speed: 125,
    }),
    crumblePlatform('l44_c1', 2440, FLOOR_TOP - 96, 96),
    crumblePlatform('l44_c2', 2580, FLOOR_TOP - 96, 96),
    spikeTrap('l44_spikes', 2760, FLOOR_TOP - 16, 96),
    fireBar('l44_fire', 2980, FLOOR_TOP - 72, 2, -1.45, 90),
    fullHeightDoor('l44_door', 3260),
    goalOnFloor('l44_goal', 3920),
  ],
};
