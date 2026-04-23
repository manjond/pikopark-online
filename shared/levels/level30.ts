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

// Level 30 — "Heave-Ho"  (Pack: Acrobatics, 2 players)
// Introduction to pickup/throw. Two buttons must latch to open the door:
//   • `btn30a` — on the floor, any player can stand on it (latching).
//   • `btn30b` — on a narrow platform at y=340 (only throw-reachable;
//     SOLO/STACK2/STACK3 feet peaks are 421/389/357 respectively — all
//     too high, but THROW_FEET_PEAK≈303 easily clears y=340).
// Player A stands on btn30a, Player B is thrown onto btn30b by Player A's
// partner (wait — only 2 players, so: Player A picks up Player B, walks
// onto btn30a while carrying, throws Player B onto btn30b). The carried
// state keeps btn30a pressed because carrier is grounded on it. Once both
// buttons latch, the door opens and both rush to the goal.
//
// Controls reminder: press **E** next to an ally to pick them up, press
// **E** again to throw in your current facing direction.

const THROW_PAD = platformRect(640, 340, 160);

export const LEVEL_30: LevelData = {
  id: 30,
  name: 'Heave-Ho',
  minPlayers: 2,

  solidRects: [groundRect(), THROW_PAD],

  spawnPoints: standardSpawns(),

  objects: [
    // Latching floor button — hold once, stays on.
    floorButton('btn30a', 260, 'door30', { latching: true, width: 64 }),
    // Latching button on the throw-only platform.
    platformButton('btn30b', THROW_PAD, 'door30', {
      latching: true, width: 48,
    }),
    fullHeightDoor('door30', 928),
    goalOnFloor('goal30', 1160),
  ],
};
