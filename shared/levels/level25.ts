import { LevelData } from '../level';
import { FLOOR_TOP, STACK2_FEET_PEAK, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorTrap, crumbleNoRespawn, pushBox } from './_helpers';

const stackPlat = platformRect(900, STACK2_FEET_PEAK, 96);
const boxSlot   = platformRect(1350, FLOOR_TOP - 32, 96);

// L25 — "Duo Finale" (Duo Synergy)
// Crumble bridges + stack jump + box puzzle. All buttons LEFT of their doors.
export const LEVEL_25: LevelData = {
  id: 25, name: 'Duo Finale', minPlayers: 2, mapWidth: 2400,
  solidRects: [
    groundSegment(0, 256), groundSegment(704, 640), groundSegment(1250, 1150),
    stackPlat, boxSlot,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('lava25a', 420, 288),
    crumbleNoRespawn('cnr25a', 400,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr25b', 464,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr25c', 608,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr25d', 662,  FLOOR_TOP - 32, 96),
    floorButton('btn25stack', stackPlat.x + 48, 'door25a', { latching: true }),
    fullHeightDoor('door25a', 1100),
    pushBox('box25', 1150, FLOOR_TOP - 32),
    floorButton('btn25box', boxSlot.x + 48, 'door25b', { latching: true }),
    fullHeightDoor('door25b', 1700),
    goalOnFloor('goal25', 2340),
  ],
};
