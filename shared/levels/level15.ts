import { LevelData } from '../level';
import {
  floorButton,
  fullHeightDoor,
  goalOnPlatform,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 15 — "Summit"  (Pack: Squad, 4 players — grand finale)
// Wide 3200px map. Combines ALL mechanics:
//   • 4 latching buttons to split up and press (section 1)
//   • 3-player stacking puzzle (section 2, 3-stack-only zone at y=370)
//   • Pressure-hold relay over a wide gap (section 3)
//   • 4 latching buttons again before the final door (section 4)
//
// All cross-section buttons are latching so the team can regroup; the only
// pressure-hold is section 3, where one player stays on btn15f while the
// others complete the path — standard "one holds, the rest finish" pattern.

const MAP_W = 3200;

const STACK3_PLAT = platformRect(1152, 370, 192); // 3-stack-only
const GOAL_PLAT   = platformRect(2880, 480, 256);

export const LEVEL_15: LevelData = {
  id: 15,
  name: 'Summit',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [
    groundRect(MAP_W),
    STACK3_PLAT,
    // Section 2 — stepping stone approach
    platformRect(960,  540, 160),
    // Section 3 — relay stepping stones
    platformRect(1792, 560, 160),
    platformRect(2048, 520, 160),
    GOAL_PLAT,
  ],

  spawnPoints: standardSpawns(),

  objects: [
    // Section 1 — four latching floor buttons (AND logic: all four must be pressed)
    floorButton('btn15a', 192, 'door15a', { latching: true }),
    floorButton('btn15b', 320, 'door15a', { latching: true }),
    floorButton('btn15c', 448, 'door15a', { latching: true }),
    floorButton('btn15d', 576, 'door15a', { latching: true }),
    fullHeightDoor('door15a', 768),
    // Section 2 — 3-stack latching button
    platformButton('btn15e', STACK3_PLAT, 'door15b', { latching: true }),
    fullHeightDoor('door15b', 1472),
    // Section 3 — relay (holder + latcher)
    floorButton('btn15f', 1664, 'door15c'),
    floorButton('btn15g', 2240, 'door15c', { latching: true }),
    fullHeightDoor('door15c', 2432),
    // Section 4 — four latching floor buttons (AND logic)
    floorButton('btn15h', 2624, 'door15d', { latching: true }),
    floorButton('btn15i', 2688, 'door15d', { latching: true }),
    floorButton('btn15j', 2752, 'door15d', { latching: true }),
    floorButton('btn15k', 2816, 'door15d', { latching: true }),
    fullHeightDoor('door15d', 3008),
    goalOnPlatform('goal15', GOAL_PLAT),
  ],
};
