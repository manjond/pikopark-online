import { LevelData } from '../level';
import {
  crumblePlatform,
  fireBar,
  floorButton,
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 18 — "Pressure Pact"  (Pack: Duo Allies, 2 players)
// Real teamwork without stacking gymnastics. Player A jumps onto a small
// pressure pedestal and stays — that pad is the only thing keeping the
// wide lava lake on B's path cool. While A holds, B threads a firebar at
// pace, lands on a shaky crumble plate, and slaps the latching button
// that unlocks the goal door. A's job ends only after the latch flips —
// any earlier and B falls into the lake.

const MAP_W = 1280;
const PEDESTAL = platformRect(64, 540, 128); // A's perch — a small stage to commit to

export const LEVEL_18: LevelData = {
  id: 18,
  name: 'Pressure Pact',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), PEDESTAL],
  spawnPoints: standardSpawns(),

  objects: [
    // Pressure pad on the pedestal — A jumps up here to hold it.
    floorButton('btn18hold', 128, 'trap18', { width: 96 }),
    // The lake B has to cross — wide enough that a running jump clears it,
    // but only barely. With the lava cold (button held) it's a sprint;
    // armed, it's instant death.
    floorTrap('trap18', 512, 320),
    // Firebar in the airspace above the cold lake — forces B to read its
    // sweep before committing to the run.
    fireBar('fb18', 512, 460, 3, 1.4, 90),
    // Crumble plate on the far side: B's first foothold after the dash.
    crumblePlatform('cr18', 720, 565, 96),
    // Latching button on the floor past the crumbles — opens the goal door.
    floorButton('btn18latch', 928, 'door18', { latching: true }),
    fullHeightDoor('door18', 1088),
    goalOnFloor('goal18', 1216),
  ],
};
