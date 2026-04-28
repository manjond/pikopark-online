import { LevelData } from '../level';
import {
  floorButton,
  floorTrap,
  fullHeightDoor,
  goalOnFloor,
  groundRect,
  platformButton,
  platformRect,
  standardSpawns,
} from './_helpers';

// Level 41 — "Tower Climb"  (Pack: Squad Legion, 4 players)
// All four players must end up on or near a single tower platform — the
// latching button up top is throw-only-from-stack-3. So the choreography:
// build a 3-stack on the launch ledge, the carrier-at-top throws the
// fourth player straight up onto the tower's button perch. Meanwhile a
// pressure pad at the spawn rim keeps the launch ledge accessible (lava
// covers the floor between spawn and the ledge — the pad disables it
// while held).

const MAP_W = 1664;
const LAUNCH = platformRect(704,  370, 192); // 3-stack reachable
const TOWER  = platformRect(704,  120, 192); // throw-from-stack3 reachable
const PED    = platformRect(64,   540, 96);

export const LEVEL_41: LevelData = {
  id: 41,
  name: 'Tower Climb',
  minPlayers: 4,
  mapWidth: MAP_W,

  solidRects: [groundRect(MAP_W), LAUNCH, TOWER, PED],
  spawnPoints: standardSpawns(),

  objects: [
    // Pressure pad on spawn rim.
    platformButton('b41hold', PED, 't41', { width: 96 }),
    floorTrap('t41', 544, 480),
    // Tower latching button — throw-from-stack3 reachable.
    platformButton('b41latch', TOWER, 'door41', { latching: true }),
    fullHeightDoor('door41', 1216),
    goalOnFloor('goal41', 1568),
  ],
};
