import { LevelData } from '../level';
import {
  FLOOR_TOP,
  goalOnFloor, groundSegment, floorButton, fullHeightDoor,
  standardSpawns, platformRect, crumblePlatform, crumbleNoRespawn,
  floorTrap, fireBar, lavaWall, floorSpring, pushBox,
} from './_helpers';

// Level 15 — "Solo Gauntlet"  (Solo Master)
// All solo mechanics: lava wall, crumble (some permanent), fire bars,
// box buttons, spring. Very long map (4000 px). Wall speed 100 px/s.

const highPlat = platformRect(2600, 200, 128);

export const LEVEL_15: LevelData = {
  id: 15,
  name: 'Solo Gauntlet',
  minPlayers: 1,
  mapWidth: 4000,
  solidRects: [
    groundSegment(0,    320),
    groundSegment(600,  640),
    groundSegment(1400, 640),
    groundSegment(2200, 96),
    groundSegment(2500, 1500),
    highPlat,
  ],
  spawnPoints: standardSpawns(),
  objects: [
    lavaWall('wall15', -64, 100),
    floorTrap('lava15a', 322, 274),
    crumblePlatform('cr15a', 320, FLOOR_TOP - 32, 96),
    crumblePlatform('cr15b', 464, FLOOR_TOP - 32, 96),
    crumbleNoRespawn('cnr15a', 608, FLOOR_TOP - 32, 96),
    floorTrap('lava15b', 710, 682),
    crumblePlatform('cr15c', 760, FLOOR_TOP - 32, 96),
    crumblePlatform('cr15d', 904, FLOOR_TOP - 32, 96),
    crumblePlatform('cr15e', 1048, FLOOR_TOP - 32, 96),
    floorTrap('lava15c', 1402, 594),
    fireBar('fb15a', 1700, FLOOR_TOP - 48, 2, 1.3, 0),
    fireBar('fb15b', 2000, FLOOR_TOP - 48, 2, -1.1, 90),
    pushBox('box15', 2200, FLOOR_TOP - 32),
    floorButton('btn15a', 2250, 'door15a', { latching: false }),
    fullHeightDoor('door15a', 2460),
    floorButton('btn15ab', 2520, 'door15a', { latching: true }),
    floorSpring('spr15', 2550, 48),
    floorButton('btn15b', 2664, 'door15b', { latching: true }),
    fullHeightDoor('door15b', 2900),
    floorButton('btn15bb', 3000, 'door15b', { latching: true }),
    floorTrap('lava15d', 3100, 96),
    fireBar('fb15c', 3400, FLOOR_TOP - 48, 3, 1.5, 180),
    goalOnFloor('goal15', 3900),
  ],
};
