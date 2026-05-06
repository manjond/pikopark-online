import { LevelData } from '../level';
import {
  FLOOR_TOP, STACK2_FEET_PEAK,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorTrap, crumbleNoRespawn, pushBox,
} from './_helpers';

// Level 25 — "Duo Synergy Finale"  (Duo Synergy)
// Combined level: crumble bridges (no-respawn), box puzzle, stack jump,
// and coordinated door timing. This is the hardest Duo level in this pack.

const stackPlat = platformRect(900, STACK2_FEET_PEAK, 96);
const boxSlot   = platformRect(1400, FLOOR_TOP - 32, 96);

export const LEVEL_25: LevelData = {
  id: 25,
  name: 'Duo Finale',
  minPlayers: 2,
  mapWidth: 2400,
  solidRects: [
    groundSegment(0, 256),
    groundSegment(704, 640),
    groundSegment(1300, 1100),
    stackPlat, boxSlot,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('lava25a', 258, 442),
    crumbleNoRespawn('cnr25a', 256,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr25b', 400,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr25c', 544,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr25d', 648,  FLOOR_TOP - 32, 96),
    floorButton('btn25stack', stackPlat.x + 48, 'door25a', { latching: true }),
    fullHeightDoor('door25a', 1100),
    floorButton('btn25ex1', 1150, 'door25a', { latching: true }),
    pushBox('box25', 1250, FLOOR_TOP - 32),
    floorButton('btn25box', boxSlot.x + 48, 'door25b', { latching: false }),
    fullHeightDoor('door25b', 1700),
    floorButton('btn25ex2', 1780, 'door25b', { latching: true }),
    goalOnFloor('goal25', 2340),
  ],
};
