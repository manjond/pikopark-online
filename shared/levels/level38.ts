import { LevelData } from '../level';
import {
  fireBar,
  floorButton,
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 38 — "Hot Cross"  (Pack: Squad Brigade, 4 players)
// Three firebars guard a long lava bridge. Three pressure pads on the
// spawn rim each disable a specific bar's danger zone (we model this
// as a trap directly under each bar). Three players hold pads; the
// fourth navigates to the latching button at the far end. Once the
// latch flips, all four can reach the goal — but the lava remains, so
// each held pad must stay held until the runner clears the bridge.

const MAP_W = 2240;

export const LEVEL_38: LevelData = {
  id: 38,
  name: 'Hot Cross',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W)],
  spawnPoints: standardSpawns(),

  objects: [
    // Three pads on the spawn rim.
    floorButton('b38hA', 96,  't38A'),
    floorButton('b38hB', 224, 't38B'),
    floorButton('b38hC', 352, 't38C'),
    // Three lava strips along the bridge — one per pad.
    floorTrap('t38A',  640, 192),
    floorTrap('t38B', 1024, 192),
    floorTrap('t38C', 1408, 192),
    // Three firebars in the bridge airspace.
    fireBar('fb38a',  640, 580, 2, 1.4,  0),
    fireBar('fb38b', 1024, 580, 2, -1.6, 60),
    fireBar('fb38c', 1408, 580, 2, 1.8,  120),
    // Latching switch at the far end.
    floorButton('b38latch', 1728, 'door38', { latching: true }),
    fullHeightDoor('door38', 1920),
    goalOnFloor('goal38', 2176),
  ],
};
