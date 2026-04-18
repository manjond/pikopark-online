import { LevelData } from '../level';
import { TILE_SIZE } from '../constants';
import {
  floorSpring,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 27 — "Trampoline Gate"  (Pack: Bounce, 2 players)
// A door blocks the path to the goal. The latching button that opens it
// sits on a platform too high for a normal jump — only the spring pad
// reaches it. One player bounces up, presses the button (latching), the
// door stays open, and both players walk through to the goal.

const BTN_PLAT = platformRect(128, 232, 256);

export const LEVEL_27: LevelData = {
  id: 27,
  name: 'Trampoline Gate',
  minPlayers: 2,

  solidRects: [groundRect(), BTN_PLAT],

  spawnPoints: standardSpawns(),

  objects: [
    floorSpring('spring27', 256),
    // Button sits flush on the platform (yOffset 4 = buttonHeight/2), matches
    // bounce pack visual convention — see _helpers.ts ButtonOpts.yOffset.
    platformButton('btn27', BTN_PLAT, 'door27', {
      latching: true, width: TILE_SIZE, yOffset: 4,
    }),
    fullHeightDoor('door27', 704),
    goalOnFloor('goal27', 1120),
  ],
};
