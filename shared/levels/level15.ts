import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, platformRect, crumblePlatform, crumbleNoRespawn, floorTrap, fireBar, lavaWall, floorSpring, pushBox } from './_helpers';

const highPlat = platformRect(2600, 200, 128);

// L15 — "Solo Gauntlet" (Solo Master)
// All solo mechanics combined. Wall 100 px/s, 4000 px map.
export const LEVEL_15: LevelData = {
  id: 15, name: 'Solo Gauntlet', minPlayers: 1, mapWidth: 4000,
  solidRects: [
    groundSegment(0, 320), groundSegment(620, 640), groundSegment(1420, 640),
    groundSegment(2200, 96), groundSegment(2500, 1500), highPlat,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall15', -64, 100),
    floorTrap('lava15a', 380, 234),
    crumblePlatform('cr15a', 320, FLOOR_TOP - 32, 96),
    crumblePlatform('cr15b', 464, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr15a', 608, FLOOR_TOP - 32, 96),
    floorTrap('lava15b', 730, 682),
    crumblePlatform('cr15c', 760, FLOOR_TOP - 32, 96),
    crumblePlatform('cr15d', 904, FLOOR_TOP - 32, 96),
    crumblePlatform('cr15e', 1048, FLOOR_TOP - 32, 96),
    floorTrap('lava15c', 1460, 594),
    fireBar('fb15a', 1700, FLOOR_TOP - 48, 2, 1.3, 0),
    fireBar('fb15b', 2000, FLOOR_TOP - 48, 2, -1.1, 90),
    pushBox('box15', 2200, FLOOR_TOP - 32),
    floorButton('btn15a', 2260, 'door15a', { latching: true }),
    fullHeightDoor('door15a', 2460),
    floorSpring('spr15', 2540, 48),
    floorButton('btn15b', 2654, 'door15b', { latching: true }),
    fullHeightDoor('door15b', 2900),
    floorTrap('lava15d', 3100, 96),
    fireBar('fb15c', 3400, FLOOR_TOP - 48, 3, 1.5, 180),
    goalOnFloor('goal15', 3900),
  ],
};
