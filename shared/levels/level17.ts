import { LevelData } from '../level';
import {
  FLOOR_TOP,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  spikeTrap,
  standardSpawns,
} from './_helpers';

const keyPlat = platformRect(640, FLOOR_TOP - 192, 160);

export const LEVEL_17: LevelData = {
  id: 17,
  name: 'Spike Switchback',
  minPlayers: 1,
  mapWidth: 2000,
  solidRects: [
    groundRect(2000),
    platformRect(380, FLOOR_TOP - 128, 128),
    keyPlat,
    platformRect(900, FLOOR_TOP - 128, 128),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    spikeTrap('l17_spikes_a', 520, FLOOR_TOP - 16, 112),
    spikeTrap('l17_spikes_b', 820, FLOOR_TOP - 16, 96),
    platformButton('l17_key', keyPlat, 'l17_door', { latching: true }),
    fullHeightDoor('l17_door', 1280),
    goalOnFloor('l17_goal', 1920),
  ],
};
