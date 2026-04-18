import { LevelData } from '../level';
import {
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 7 — "Wide Relay"  (Pack: Duo, 2 players)
// Scrolling 1920px map. Player A holds pressure btn7a → door7a opens.
// Player B crosses and steps on btn7b (latching) → door7b opens forever.
// Player A releases btn7a and runs through. Both reach the goal.

const MAP_W = 1920;

export const LEVEL_7: LevelData = {
  id: 7,
  name: 'Wide Relay',
  minPlayers: 2,
  mapWidth: MAP_W,

  solidRects: [
    groundRect(MAP_W),
    platformRect(512, 560, 213),
    platformRect(1152, 520, 213),
  ],

  spawnPoints: standardSpawns(),

  objects: [
    floorButton('btn7a', 256, 'door7a'),
    fullHeightDoor('door7a', 640, 'btn7a'),
    floorButton('btn7b', 1024, 'door7b', { latching: true }),
    fullHeightDoor('door7b', 1280, 'btn7b'),
    goalOnFloor('goal7', 1760),
  ],
};
