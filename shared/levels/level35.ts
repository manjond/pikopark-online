import { LevelData } from '../level';
import {
  crumblePlatform,
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 35 — "Crumble Race"  (Pack: Squad Crew, 4 players)
// Four parallel crumble lanes over a single lava lake. Each lane ends at
// a stack-only latching button on its own little ledge. All four must be
// latched to open the goal door. Players race in tandem — if anyone
// pauses mid-lane, their plate falls. After the lanes, pair up to stack
// each ledge: 4 players, 4 ledges, must coordinate stack-pairs.

const MAP_W = 1920;
const LEDGE1 = platformRect(384,  400, 96);
const LEDGE2 = platformRect(640,  400, 96);
const LEDGE3 = platformRect(896,  400, 96);
const LEDGE4 = platformRect(1152, 400, 96);

export const LEVEL_35: LevelData = {
  id: 35,
  name: 'Crumble Race',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), LEDGE1, LEDGE2, LEDGE3, LEDGE4],
  spawnPoints: standardSpawns(),

  objects: [
    floorTrap('t35', 720, 832),
    // 4 parallel crumble lanes.
    crumblePlatform('c35a1', 320,  600, 96), crumblePlatform('c35a2', 320,  540, 96), crumblePlatform('c35a3', 320,  480, 96),
    crumblePlatform('c35b1', 576,  600, 96), crumblePlatform('c35b2', 576,  540, 96), crumblePlatform('c35b3', 576,  480, 96),
    crumblePlatform('c35c1', 832,  600, 96), crumblePlatform('c35c2', 832,  540, 96), crumblePlatform('c35c3', 832,  480, 96),
    crumblePlatform('c35d1', 1088, 600, 96), crumblePlatform('c35d2', 1088, 540, 96), crumblePlatform('c35d3', 1088, 480, 96),
    // 4 stack-only latching buttons.
    platformButton('b35a', LEDGE1, 'door35', { latching: true }),
    platformButton('b35b', LEDGE2, 'door35', { latching: true }),
    platformButton('b35c', LEDGE3, 'door35', { latching: true }),
    platformButton('b35d', LEDGE4, 'door35', { latching: true }),
    fullHeightDoor('door35', 1440),
    goalOnFloor('goal35', 1856),
  ],
};
