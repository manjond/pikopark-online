import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, floorTrap, fireBar, crumbleNoRespawn, lavaWall } from './_helpers';

// L29 — "Chaos Duo" (Duo Trust)
// All duo mechanics. TWO doors each with ONE latching button, both left of door.
export const LEVEL_29: LevelData = {
  id: 29, name: 'Chaos Duo', minPlayers: 2, mapWidth: 2800,
  solidRects: [
    groundSegment(0, 320), groundSegment(800, 640), groundSegment(1600, 1200),
  ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall29', -64, 105),
    floorTrap('lava29a', 380, 420),
    crumbleNoRespawn('cnr29a', 320, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr29b', 464, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr29c', 608, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr29d', 752, FLOOR_TOP - 32, 96),
    fireBar('fb29a', 1000, FLOOR_TOP - 48, 2, 1.2, 0),
    floorTrap('lava29b', 1220, 64),
    floorButton('btn29a', 1250, 'door29a', { latching: true }),
    fullHeightDoor('door29a', 1450),
    floorButton('btn29b', 1700, 'door29b', { latching: true }),
    floorButton('btn29c', 2000, 'door29b', { latching: true }),
    fullHeightDoor('door29b', 2300),
    goalOnFloor('goal29', 2720),
  ],
};
