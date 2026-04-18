import { LevelData } from '../level';
import {
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 9 — "Gauntlet"  (Pack: Duo, 2 players)
// Wide 2560px map divided into 3 sections:
//   Section 1 (0–768):   latching trigger — press and go
//   Section 2 (768–1792): stacking puzzle — stack to reach latching button
//   Section 3 (1792–2560): pressure hold — one player holds, the other
//                          reaches the goal (only one player needs to touch
//                          the goal for the room to complete).

const MAP_W = 2560;

const STACK_PLAT = platformRect(960, 395, 192); // stacking-only

export const LEVEL_9: LevelData = {
  id: 9,
  name: 'Gauntlet',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    groundRect(MAP_W),
    platformRect(512, 560, 128),   // stepping stone over the relay gap
    STACK_PLAT,                    // section 2
    platformRect(2048, 540, 192),  // stepping stone near final button
  ],

  spawnPoints: standardSpawns(),

  objects: [
    // Section 1 — latching trigger
    floorButton('btn9a', 192, 'door9a', { latching: true }),
    fullHeightDoor('door9a', 640, 'btn9a'),
    // Section 2 — latching stack button
    platformButton('btn9b', STACK_PLAT, 'door9b', { latching: true }),
    fullHeightDoor('door9b', 1280, 'btn9b'),
    // Section 3 — pressure-hold relay (1 holds, the other reaches goal)
    floorButton('btn9c', 2176, 'door9c'),
    fullHeightDoor('door9c', 2368, 'btn9c'),
    goalOnFloor('goal9', 2464),
  ],
};
