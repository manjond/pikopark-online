import { LevelData } from '../level';
import {
  FLOOR_TOP,
  fireBar,
  floorButton,
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundSegment,
  movingPlatform,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

const relayTower = platformRect(1500, FLOOR_TOP - 344, 160);

export const LEVEL_14: LevelData = {
  id: 14,
  name: 'Relay Bridges',
  minPlayers: 4,
  mapWidth: 3000,
  solidRects: [
    groundSegment(0, 520),
    groundSegment(1060, 940),
    groundSegment(2120, 880),
    platformRect(1730, FLOOR_TOP - 128, 160),
    relayTower,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorButton('l14_crew_lock', 340, 'l14_door', {
      latching: true,
      requiredPlayers: 4,
      width: 176,
    }),
    movingPlatform('l14_bridge', 576, FLOOR_TOP - 128, 128, {
      axis: 'x',
      from: 640,
      to: 940,
      speed: 100,
    }),
    platformButton('l14_stack_latch', relayTower, 'l14_door', { latching: true }),
    floorTrap('l14_lava_skip', 1810, 96),
    fireBar('l14_firebar', 1970, FLOOR_TOP - 80, 2, 1.2, 45),
    fullHeightDoor('l14_door', 2200),
    goalOnFloor('l14_goal', 2920),
  ],
};
