import { LevelData } from '../level';
import { FLOOR_TOP, STACK3_FEET_PEAK, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorTrap, fireBar, crumbleNoRespawn, lavaWall, pushBox, floorSpring } from './_helpers';

const highPlat = platformRect(2400, 200, 128);

// L30 — "Duo Trust Finale" (Duo Trust)
// All duo mechanics, 4000 px, wall 95 px/s. Every button left of its door.
export const LEVEL_30: LevelData = {
  id: 30, name: 'Duo Trust Finale', minPlayers: 2, mapWidth: 4000,
  solidRects: [
    groundSegment(0, 320), groundSegment(900, 480), groundSegment(1700, 480),
    groundSegment(2350, 1650), highPlat,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall30', -64, 95),
    floorTrap('lava30a', 380, 516),
    crumbleNoRespawn('cnr30a', 320, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr30b', 464, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr30c', 608, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr30d', 752, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr30e', 848, FLOOR_TOP - 32, 96),
    floorTrap('lava30b', 1380, 64),
    fireBar('fb30a', 1200, FLOOR_TOP - 48, 2, 1.3, 0),
    floorTrap('lava30c', 1760, 516),
    pushBox('box30a', 1650, FLOOR_TOP - 32),
    pushBox('box30b', 1850, FLOOR_TOP - 32),
    floorButton('btn30boxa', 1900, 'door30a', { latching: true }),
    floorButton('btn30boxb', 2100, 'door30a', { latching: true }),
    fullHeightDoor('door30a', 2300),
    floorSpring('spr30', 2360, 48),
    floorButton('btn30spr', 2480, 'door30b', { latching: true }),
    fullHeightDoor('door30b', 2800),
    fireBar('fb30b', 3100, FLOOR_TOP - 48, 3, -1.2, 60),
    floorButton('btn30c', 3500, 'door30c', { latching: true }),
    floorButton('btn30d', 3700, 'door30c', { latching: true }),
    fullHeightDoor('door30c', 3800),
    goalOnFloor('goal30', 3920),
  ],
};
