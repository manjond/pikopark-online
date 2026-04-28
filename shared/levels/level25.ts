import { LevelData } from '../level';
import {
  crumblePlatform,
  floorButton,
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 25 — "Synced Crumble"  (Pack: Duo Synergy, 2 players)
// Twin crumble lanes side by side over a single lava lake. Each lane ends
// at a latching button on a stack-only platform. Both buttons must be
// active to open the goal door. So: race together (one stops, both die),
// stack at the end, alternate stacker/rider so each platform gets latched.

const MAP_W = 1664;
const LANE_BTN_LEFT  = platformRect(960,  400, 160);
const LANE_BTN_RIGHT = platformRect(1184, 400, 160);

export const LEVEL_25: LevelData = {
  id: 25,
  name: 'Synced Crumble',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    groundRect(MAP_W),
    LANE_BTN_LEFT,
    LANE_BTN_RIGHT,
  ],
  spawnPoints: standardSpawns(),

  objects: [
    // The two crumble lanes share one wide lava lake — fall into either
    // lane and you hit the lake.
    floorTrap('trap25', 624, 672),

    // Top lane — slightly higher so jumping between the two is possible
    // mid-run if a player needs to bail to the other lane.
    crumblePlatform('cr25h1', 192, 540, 96),
    crumblePlatform('cr25h2', 352, 510, 96),
    crumblePlatform('cr25h3', 512, 480, 96),
    crumblePlatform('cr25h4', 672, 510, 96),
    crumblePlatform('cr25h5', 832, 540, 96),

    // Bottom lane (low, near floor): different rhythm, must commit.
    crumblePlatform('cr25l1', 192, 600, 96),
    crumblePlatform('cr25l2', 352, 600, 96),
    crumblePlatform('cr25l3', 512, 600, 96),
    crumblePlatform('cr25l4', 672, 600, 96),
    crumblePlatform('cr25l5', 832, 600, 96),

    // Stack-only latching buttons at lane ends.
    platformButton('btn25hi', LANE_BTN_LEFT,  'door25', { latching: true }),
    platformButton('btn25lo', LANE_BTN_RIGHT, 'door25', { latching: true }),

    // After both latched, the door opens.
    fullHeightDoor('door25', 1408),
    // Pressure helper on the spawn rim disables a final lava strip past
    // the door, so even if one player remains stuck on a button platform
    // the other can still reach the goal — keeps the level recoverable.
    floorButton('btn25helper', 64, 'trap25final'),
    floorTrap('trap25final', 1504, 96),
    goalOnFloor('goal25', 1600),
  ],
};
