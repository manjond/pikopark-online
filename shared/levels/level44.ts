import { LevelData } from '../level';
import {
  FLOOR_TOP, STACK2_FEET_PEAK, STACK3_FEET_PEAK,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, floorTrap, fireBar, pushBox,
  movingPlatform,
} from './_helpers';

// Level 44 — "Synchronized"  (Squad Legion)
// Moving platforms + fire bars + boxes. Complex timing for all 4 players.

const ferryW = 96;
const ferry1 = movingPlatform('plat44a', 400, FLOOR_TOP - 80, ferryW, {
  axis: 'x', from: 400 + ferryW / 2, to: 800 + ferryW / 2, speed: 150,
});
const ferry2 = movingPlatform('plat44b', 1000, FLOOR_TOP - 112, ferryW, {
  axis: 'x', from: 1000 + ferryW / 2, to: 1400 + ferryW / 2, speed: 180,
});
const stackPlat = platformRect(2200, STACK2_FEET_PEAK, 128);

export const LEVEL_44: LevelData = {
  id: 44,
  name: 'Synchronized',
  minPlayers: 4,
  mapWidth: 3200,
  solidRects: [
    groundSegment(0, 400),
    groundSegment(900, 128),
    groundSegment(1500, 700),
    groundSegment(2300, 900),
    stackPlat,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('lava44a', 400, 500),
    floorTrap('lava44b', 1030, 470),
    ferry1, ferry2,
    floorButton('btn44a', 960, 'door44a', { latching: true }),
    fullHeightDoor('door44a', 1200),
    floorButton('btn44ab', 1280, 'door44a', { latching: true }),
    fireBar('fb44a', 1800, FLOOR_TOP - 48, 2, 1.2, 0),
    pushBox('box44a', 1700, FLOOR_TOP - 32),
    pushBox('box44b', 1850, FLOOR_TOP - 32),
    floorButton('btn44b', 2000, 'door44b', { latching: false }),
    floorButton('btn44c', 2100, 'door44b', { latching: false }),
    floorButton('btn44stack', stackPlat.x + 64, 'door44b', { latching: true }),
    floorButton('btn44d', 2600, 'door44b', { latching: true }),
    fullHeightDoor('door44b', 2800),
    floorButton('btn44ex', 2880, 'door44b', { latching: true }),
    goalOnFloor('goal44', 3100),
  ],
};
