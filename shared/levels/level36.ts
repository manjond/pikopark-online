import { LevelData } from '../level';
import {
  floorButton,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  standardSpawns,
} from './_helpers';

// Level 36 — "Two Holds Two Cross"  (Pack: Squad Brigade, 4 players)
// Two pressure pads side-by-side on the spawn rim must BOTH be held to
// open the central path (server AND-logic). Two players hold; the other
// two cross. Past the path are two latching switches — once both flip,
// the goal door opens. The latches keep the goal door open whether the
// pads stay held or not, so the held pair can leave their pads after
// the latches click — but the central path closes behind them, so the
// pad-holders are stranded. Only the free pair can reach the goal,
// which is enough to complete the level.

const MAP_W = 1664;

export const LEVEL_36: LevelData = {
  id: 36,
  name: 'Two Holds Two Cross',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W)],
  spawnPoints: standardSpawns(),

  objects: [
    // Two pressure pads — both linked to door36path (AND logic).
    floorButton('b36holdL', 128, 'door36path'),
    floorButton('b36holdR', 256, 'door36path'),
    fullHeightDoor('door36path', 480),
    // Two latching switches past the path.
    floorButton('b36latchL', 768,  'door36goal', { latching: true }),
    floorButton('b36latchR', 1024, 'door36goal', { latching: true }),
    fullHeightDoor('door36goal', 1280),
    goalOnFloor('goal36', 1600),
  ],
};
