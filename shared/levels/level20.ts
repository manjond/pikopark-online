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

// Level 20 — "Crumble Together"  (Pack: Duo Allies, 2 players)
// Long crumble bridge over a lava lake. Players run in tandem — if either
// stops too long, the platforms fall and they die. Past the bridge, a
// stacking-only latching button finally opens the goal door. The crumble
// run is the trust exercise; the stack is the calm reward.

const MAP_W = 1664;
const STACK_PT = platformRect(1216, 400, 160);

export const LEVEL_20: LevelData = {
  id: 20,
  name: 'Crumble Together',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), STACK_PT],
  spawnPoints: standardSpawns(),

  objects: [
    // Bridge over a long lava lake. The strip is far too wide for any
    // single jump; the only way across is the chain of crumble plates.
    floorTrap('trap20', 720, 800),
    crumblePlatform('cr20a', 256, 565, 96),
    crumblePlatform('cr20b', 416, 565, 96),
    crumblePlatform('cr20c', 576, 565, 96),
    crumblePlatform('cr20d', 736, 565, 96),
    crumblePlatform('cr20e', 896, 565, 96),
    // After the bridge, a stack-only latch opens the goal door.
    platformButton('btn20stack', STACK_PT, 'door20', { latching: true }),
    fullHeightDoor('door20', 1472),
    goalOnFloor('goal20', 1600),
  ],
};
