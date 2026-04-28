import { LevelData } from '../level';
import {
  crumblePlatform,
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

// Level 44 — "Fire Storm"  (Pack: Squad Legion, 4 players)
// Wide arena packed with eight firebars at varying heights and speeds.
// Three pressure pads on the spawn rim each link to a different lava
// strip in the bridge — three players hold while the fourth threads
// the bars to a stack-only latching button at the far end. The held
// players are committed for the whole crossing; one wrong release and
// the runner cooks. Final kicker — a row of crumble plates after the
// stack-only button feeds into the goal.

const MAP_W = 2560;
const STACK_FINAL = platformRect(1920, 400, 192);

export const LEVEL_44: LevelData = {
  id: 44,
  name: 'Fire Storm',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), STACK_FINAL],
  spawnPoints: standardSpawns(),

  objects: [
    // Three pressure pads → three lava strips along the bridge.
    floorButton('b44hA', 96,  't44A'),
    floorButton('b44hB', 224, 't44B'),
    floorButton('b44hC', 352, 't44C'),
    floorTrap('t44A',  608, 192),
    floorTrap('t44B', 1024, 192),
    floorTrap('t44C', 1440, 192),
    // Eight firebars — alternating directions, varying segments.
    fireBar('fb44a',  608, 580, 2, 1.4,  0),
    fireBar('fb44b',  800, 460, 3, -1.6, 60),
    fireBar('fb44c', 1024, 580, 2, 1.8,  120),
    fireBar('fb44d', 1216, 460, 3, -1.4, 180),
    fireBar('fb44e', 1440, 580, 2, 2.0,  240),
    fireBar('fb44f', 1632, 460, 3, -1.8, 0),
    fireBar('fb44g', 1824, 540, 2, 1.6,  90),
    fireBar('fb44h', 2016, 380, 2, -1.6, 180),
    // Stack-only latch.
    platformButton('b44latch', STACK_FINAL, 'door44', { latching: true }),
    fullHeightDoor('door44', 2240),
    // Crumble approach to the goal.
    floorTrap('t44spit', 2384, 192),
    crumblePlatform('cr44a', 2304, 565, 96),
    crumblePlatform('cr44b', 2432, 565, 96),
    goalOnFloor('goal44', 2528),
  ],
};
