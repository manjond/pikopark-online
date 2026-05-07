import { LevelData } from '../level';
import { FLOOR_TOP, STACK2_FEET_PEAK, goalOnFloor, groundSegment, floorButton, platformButton, fullHeightDoor, standardSpawns, platformRect, floorTrap, crumbleNoRespawn, pushBox } from './_helpers';

const stackPlat = platformRect(900, STACK2_FEET_PEAK, 96);
// Box slot: button ON TOP of a platform that is well above floor level
const boxPlat   = platformRect(1350, FLOOR_TOP - 96, 96);   // top at y=592 (safe, not blocking)

// L25 — "Duo Finale" (Duo Synergy)
// Crumble bridges + stack jump + box puzzle. Box button now on TOP of platform.
export const LEVEL_25: LevelData = {
  id: 25, name: 'Duo Finale', minPlayers: 2, mapWidth: 2400,
  solidRects: [
    groundSegment(0, 256), groundSegment(704, 640), groundSegment(1250, 1150),
    stackPlat, boxPlat,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('lava25a', 330, 368),
    crumbleNoRespawn('cnr25a', 320,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr25b', 464,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr25c', 608,  FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr25d', 662,  FLOOR_TOP - 32, 96),
    floorButton('btn25stack', stackPlat.x + 48, 'door25a', { latching: true }),
    fullHeightDoor('door25a', 1100),
    pushBox('box25', 1150, FLOOR_TOP - 32),
    // Button ON TOP of boxPlat (not inside it)
    platformButton('btn25box', boxPlat, 'door25b', { latching: false }),
    fullHeightDoor('door25b', 1700),
    goalOnFloor('goal25', 2340),
  ],
};
