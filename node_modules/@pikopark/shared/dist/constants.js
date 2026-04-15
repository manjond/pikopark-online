export const MAX_PLAYERS = 8;
export const MIN_PLAYERS_TO_START = 2;
export const SERVER_PORT = 2567;
export const CLIENT_PORT = 5173;
/** Server authoritative tick rate (Hz) */
export const TICK_RATE = 20;
/** Pixel-art base resolution */
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 270;
export const TILE_SIZE = 16;
/** Arcade physics gravity (px/s²) */
export const GRAVITY = 800;
/** Player movement speed (px/s) */
export const MOVE_SPEED = 150;
/** Player jump impulse (px/s, negative = upward) */
export const JUMP_VELOCITY = -400;
/** One hex color per player slot (P1-P8) */
export const PLAYER_COLORS = [
    0xff0000, // P1 Red
    0x0000ff, // P2 Blue
    0x00cc00, // P3 Green
    0xffff00, // P4 Yellow
    0x9900cc, // P5 Purple
    0xff7700, // P6 Orange
    0xff69b4, // P7 Pink
    0x00cccc, // P8 Cyan
];
