import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorTrap,
} from './_helpers';

// Level 19 — "Relay"  (Duo Allies)
// A pressure button (requiredPlayers:1) opens a door. Player A holds button;
// Player B runs through and presses a latching button on the other side,
// permanently opening a second door. Then A can release and go through.
// Design: door2 is latching — no trapping.

export const LEVEL_19: LevelData = {
  id: 19,
  name: 'Relay',
  minPlayers: 2,
  mapWidth: 2000,
  solidRects: [
    groundSegment(0, 2000),
    platformRect(600, FLOOR_TOP - 80, 96),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    // Door 1: opened by pressure button — one player holds, other crosses
    floorButton('btn19press', 500, 'door19a', { latching: false, requiredPlayers: 1 }),
    fullHeightDoor('door19a', 700),
    // Latching button on far side of door1 — press to permanently open door1
    floorButton('btn19latch', 850, 'door19a', { latching: true }),
    // Main door 2
    floorTrap('trap19', 1200, 80),
    floorButton('btn19b', 1450, 'door19b', { latching: true }),
    fullHeightDoor('door19b', 1650),
    floorButton('btn19bx', 1760, 'door19b', { latching: true }),
    goalOnFloor('goal19', 1940),
  ],
};
