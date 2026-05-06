import { LevelData } from '../level';
import { FLOOR_TOP, STACK2_FEET_PEAK, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorTrap, fireBar, pushBox, movingPlatform } from './_helpers';

const f1W = 96;
const ferry1 = movingPlatform('plat44a', 400, FLOOR_TOP - 80, f1W, { axis: 'x', from: 400+f1W/2, to: 800+f1W/2, speed: 150 });
const f2W = 96;
const ferry2 = movingPlatform('plat44b', 1000, FLOOR_TOP - 112, f2W, { axis: 'x', from: 1000+f2W/2, to: 1400+f2W/2, speed: 180 });
const stackPlat = platformRect(2200, STACK2_FEET_PEAK, 128);

// L44 — "Synchronized" (Squad Legion)
// Moving platforms + fire bars + boxes + stacking. All buttons left of doors.
export const LEVEL_44: LevelData = {
  id: 44, name: 'Synchronized', minPlayers: 4, mapWidth: 3200,
  solidRects: [
    groundSegment(0, 400), groundSegment(900, 128), groundSegment(1500, 700),
    groundSegment(2300, 900), stackPlat,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('lava44a', 400, 500),
    floorTrap('lava44b', 1030, 470),
    ferry1, ferry2,
    floorButton('btn44a', 960, 'door44a', { latching: true }),
    fullHeightDoor('door44a', 1200),
    fireBar('fb44a', 1800, FLOOR_TOP - 48, 2, 1.2, 0),
    pushBox('box44a', 1700, FLOOR_TOP - 32),
    pushBox('box44b', 1850, FLOOR_TOP - 32),
    floorButton('btn44b', 2000, 'door44b', { latching: true }),
    floorButton('btn44c', 2100, 'door44b', { latching: true }),
    floorButton('btn44stack', stackPlat.x + 64, 'door44b', { latching: true }),
    floorButton('btn44d', 2600, 'door44b', { latching: true }),
    fullHeightDoor('door44b', 2800),
    goalOnFloor('goal44', 3100),
  ],
};
