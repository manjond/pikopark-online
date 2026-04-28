import { LevelData } from '../level';
import {
  crumblePlatform,
  fireBar,
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 29 — "Crumble Carry"  (Pack: Duo Trust, 2 players)
// Carrier picks up partner and walks across a crumble bridge — the
// carrier is grounded the whole way (so the bridge crumbles under the
// extra weight) but the partner is pinned and weightless on the bridge.
// The carry mechanic puts the rider over a permanent lava floor, so a
// fall by the carrier is a restart for both. Halfway across, the carrier
// stops on a pressure pad to disarm the second half. The rider — still
// carried — gets thrown forward to the latching switch. The throw is
// the gamble: too soon and rider falls in the lava; too late and the
// platform under the carrier crumbles.

const MAP_W = 1920;
const STAGE = platformRect(960, 540, 160); // pressure-pad stage halfway across
const LATCH_PAD = platformRect(1408, 320, 192); // throw-only

export const LEVEL_29: LevelData = {
  id: 29,
  name: 'Crumble Carry',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), STAGE, LATCH_PAD],
  spawnPoints: standardSpawns(),

  objects: [
    // Permanent lava lake from spawn rim to the goal column.
    floorTrap('trap29', 1056, 1408),
    // Crumble bridge segment 1 — five plates leading to the pressure stage.
    crumblePlatform('cr29a', 384, 565, 96),
    crumblePlatform('cr29b', 528, 565, 96),
    crumblePlatform('cr29c', 672, 565, 96),
    crumblePlatform('cr29d', 816, 565, 96),

    // Pressure pad halfway — clears the next firebar zone.
    platformButton('btn29pad', STAGE, 'fb29hold', { width: 160 }),
    // The "firebar to disable" trick — we use a trap that's positioned
    // at the firebar's swing radius. Holding the pad disables the trap
    // strip; the firebar still rotates visually but its kill arc is
    // off-floor over the safe pad. Practically: B holds, A (carried) is
    // thrown past it.
    floorTrap('fb29hold', 1216, 192),
    fireBar('fb29', 1216, 460, 3, 1.6, 90),

    // Throw-only latch perch at the bridge's far end.
    platformButton('btn29latch', LATCH_PAD, 'door29', { latching: true }),
    fullHeightDoor('door29', 1696),

    // Goal-side approach — short crumble plate just before the goal,
    // so the rider's landing isn't a free walk.
    crumblePlatform('cr29final', 1632, 565, 96),
    goalOnFloor('goal29', 1856),
  ],
};
