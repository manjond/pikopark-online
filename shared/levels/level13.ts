import { LevelData } from '../level';
import {
  crumblePlatform,
  fireBar,
  floorSpring,
  floorTrap,
  goalOnPlatform,
  groundRect,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 13 — "Spring Tower"  (Pack: Solo Master, 1 player)
// A vertical climb. The spring at the foot launches you near the rooftop.
// On the way up you pass two firebars guarding two crumble platforms — you
// can only land on one for a heartbeat before it falls. Reach the goal
// roost at the top of the tower.

const MAP_W = 1280;
const MID_A    = platformRect(384, 280, 192);
const TOP_LIP  = platformRect(800, 200, 192);
const GOAL_PAD = platformRect(960, 100, 192);

export const LEVEL_13: LevelData = {
  id: 13,
  name: 'Spring Tower',
  minPlayers: 1,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), MID_A, TOP_LIP, GOAL_PAD],
  spawnPoints: standardSpawns(),

  objects: [
    floorTrap('trap13', 480, 768),       // floor is mostly lava — no falling back
    floorSpring('spring13', 96),
    // Crumbles between MID_A and TOP_LIP — break the rise into two stages.
    crumblePlatform('cr13a', 576, 235, 96),
    crumblePlatform('cr13b', 704, 160, 96),
    fireBar('fb13a', 480, 200, 3, 1.5, 0),
    fireBar('fb13b', 800, 130, 2, -1.8, 90),
    goalOnPlatform('goal13', GOAL_PAD),
  ],
};
