export const MAX_PLAYERS = 8;
export const MIN_PLAYERS_TO_START = 2;

export const SERVER_PORT = 2567;
export const CLIENT_PORT = 5173;

/** Server authoritative tick rate (Hz) */
export const TICK_RATE = 20;

/** Game canvas resolution — 1280×720 (HD, 16:9) */
export const GAME_WIDTH  = 1280;
export const GAME_HEIGHT = 720;

/** Tile size in pixels — 32×32 px per tile */
export const TILE_SIZE = 32;

/**
 * Physics constants — scaled from the original 480×270 design by 8/3
 * so jump height and movement speed are visually identical relative to
 * screen size.  All values are in pixels/s or pixels/s².
 */

/** World gravity (px/s²) */
export const GRAVITY = 2133;

/** Player jump impulse (px/s, negative = upward) */
export const JUMP_VELOCITY = -1067;

/** Player horizontal movement speed (px/s) */
export const MOVE_SPEED = 400;

/** One hex color per player slot (P1-P8) */
export const PLAYER_COLORS: readonly number[] = [
  0xff3333, // P1 Red
  0x3366ff, // P2 Blue
  0x33cc44, // P3 Green
  0xffdd00, // P4 Yellow
  0xaa33cc, // P5 Purple
  0xff8800, // P6 Orange
  0xff69b4, // P7 Pink
  0x00ccdd, // P8 Cyan
];
