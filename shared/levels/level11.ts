import { LevelData } from '../level';
import {
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  standardSpawns,
} from './_helpers';

// Level 11 — "Four Keys"  (Pack: Squad, 4 players)
// 4 latching buttons spread across the map — each player picks one and
// presses it. The door only opens once *all four* are active (AND logic),
// then stays open so everyone can reach the goal.

const MAP_W = 1280;

export const LEVEL_11: LevelData = {
  id: 11,
  name: 'Four Keys',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W)],

  spawnPoints: standardSpawns(),

  objects: [
    floorButton('btn11a', 128, 'door11', { latching: true }),
    floorButton('btn11b', 256, 'door11', { latching: true }),
    floorButton('btn11c', 384, 'door11', { latching: true }),
    floorButton('btn11d', 512, 'door11', { latching: true }),
    fullHeightDoor('door11', 704),
    goalOnFloor('goal11', 1152),
  ],
};
