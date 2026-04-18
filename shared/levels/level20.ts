import { LevelData } from '../level';
import {
  floorButton,
  floorTrap,
  fullHeightDoor,
  goalOnPlatform,
  groundRect,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 20 — "The Gauntlet"  (Pack: Hazards, 2 players)
// Wide map. Three spike zones, two buttons, and a stacking section.
// Player A holds the pressure button (opens door to mid section).
// Player B navigates through spikes to press the latching button.
// Both then navigate the spiked final section to reach the goal.

const MAP_W = 2560;

const GOAL_PLAT = platformRect(2368, 460, 160); // solo-reachable

export const LEVEL_20: LevelData = {
  id: 20,
  name: 'The Gauntlet',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    groundRect(MAP_W),
    // Platforms to jump over spike zones
    platformRect(640,  533, 192),
    platformRect(1408, 507, 192),
    platformRect(2048, 533, 192),
    GOAL_PLAT,
  ],

  spawnPoints: standardSpawns(),

  objects: [
    // Spike zone 1
    floorTrap('trap20a', 736, 96),
    // Pressure button — Player A holds it to open door to mid-section
    floorButton('btn20a', 384, 'door20a'),
    fullHeightDoor('door20a', 960),
    // Spike zone 2
    floorTrap('trap20b', 1504, 96),
    // Latching button — Player B presses this permanently opening door 2
    floorButton('btn20b', 1280, 'door20b', { latching: true }),
    fullHeightDoor('door20b', 1792),
    // Spike zone 3 — final challenge
    floorTrap('trap20c', 2144, 128),
    goalOnPlatform('goal20', GOAL_PLAT),
  ],
};
