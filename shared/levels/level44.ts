import { LevelData } from '../level';
import { FLOOR_TOP, STACK2_FEET_PEAK, goalOnFloor, groundRect, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorTrap, fireBar, pushBox, movingPlatform } from './_helpers';

const f1W = 96;
const ferry1 = movingPlatform('plat44a', 400, FLOOR_TOP - 80, f1W, { axis: 'x', from: 400+f1W/2, to: 800+f1W/2, speed: 150 });
const f2W = 96;
const ferry2 = movingPlatform('plat44b', 1000, FLOOR_TOP - 112, f2W, { axis: 'x', from: 1000+f2W/2, to: 1400+f2W/2, speed: 180 });
const stackPlat = platformRect(2200, STACK2_FEET_PEAK, 128);

// L44 — "Synchronized" (Squad Legion)
// Boxes start BEFORE lava, so they can be pushed right to their buttons.
export const LEVEL_44: LevelData = {
  id: 44, name: 'Synchronized', minPlayers: 4, mapWidth: 3200,
  solidRects: [
    groundRect(3200),
    stackPlat,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('lava44a', 400, 500),
    floorTrap('lava44b', 1360, 280),
    ferry1, ferry2,
    floorButton('btn44a', 820, 'door44a', { latching: true }),
    fullHeightDoor('door44a', 1200),
    fireBar('fb44a', 1800, FLOOR_TOP - 48, 2, 1.2, 0),
    // Boxes start RIGHT of lava44b (x=1500+) — can be pushed to buttons at 2000+
    pushBox('box44a', 1520, FLOOR_TOP - 32),
    pushBox('box44b', 1650, FLOOR_TOP - 32),
    floorButton('btn44b', 2000, 'door44b', { latching: false }),
    floorButton('btn44c', 2100, 'door44b', { latching: false }),
    floorButton('btn44stack', stackPlat.x + 64, 'door44b', { latching: true }),
    floorButton('btn44d', 2600, 'door44b', { latching: true }),
    fullHeightDoor('door44b', 2800),
    goalOnFloor('goal44', 3100),
  ],
};
