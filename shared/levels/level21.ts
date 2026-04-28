import { LevelData } from '../level';
import {
  crumblePlatform,
  fireBar,
  floorButton,
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  standardSpawns,
} from './_helpers';

// Level 21 — "Trapdoor"  (Pack: Duo Synergy, 2 players)
// Two-stage trust puzzle, no solo shortcuts. Stage 1: A holds the pad on
// the spawn rim; that opens the door so B can pass. While the door is
// held open, B sprints under a swinging firebar, hops a crumble plate
// over a small lava strip, and slaps the latching button — that latch
// opens the goal door for good. With the latch up, A can finally leave
// the pad (door A slams behind A but A doesn't need it; the goal door is
// the only one between B and the finish).

const MAP_W = 1664;

export const LEVEL_21: LevelData = {
  id: 21,
  name: 'Trapdoor',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W)],
  spawnPoints: standardSpawns(),

  objects: [
    // Stage 1 — A's pressure pad and the gate it opens.
    floorButton('btn21hold', 96, 'door21a'),
    fullHeightDoor('door21a', 384),
    // The crossing — short lava strip, a crumble plate over it, and a
    // firebar swinging in the airspace.
    floorTrap('trap21', 576, 192),
    crumblePlatform('cr21', 528, 565, 96),
    fireBar('fb21', 576, 460, 3, 1.5, 0),
    // Stage 2 — latching button past the crossing flips the goal door.
    floorButton('btn21latch', 928, 'door21goal', { latching: true }),
    fullHeightDoor('door21goal', 1280),
    goalOnFloor('goal21', 1568),
  ],
};
