import { LevelData } from '../level';
import { FLOOR_TOP, goalOnFloor, groundSegment, floorButton, fullHeightDoor, standardSpawns, floorTrap, movingPlatform } from './_helpers';

const f1W = 96;
const ferry1 = movingPlatform('plat8a', 288, FLOOR_TOP - 64, f1W, { axis: 'x', from: 288+f1W/2, to: 700+f1W/2, speed: 140 });
const f2W = 96;
const ferry2 = movingPlatform('plat8b', 860, FLOOR_TOP - 96, f2W, { axis: 'x', from: 860+f2W/2, to: 1200+f2W/2, speed: 160 });

// L8 — "Moving Day" (Solo Adept)
// Two ferries cross lava pits. Mid-island button opens door.
export const LEVEL_8: LevelData = {
  id: 8, name: 'Moving Day', minPlayers: 1, mapWidth: 1800,
  solidRects: [ groundSegment(0, 288), groundSegment(800, 64), groundSegment(1300, 500) ],
  spawnPoints: standardSpawns(),
  objects: [
    floorTrap('lava8a', 400, 440),
    floorTrap('lava8b', 900, 400),
    ferry1, ferry2,
    floorButton('btn8', 820, 'door8', { latching: true }),
    fullHeightDoor('door8', 1460),
    goalOnFloor('goal8', 1730),
  ],
};
