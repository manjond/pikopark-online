/**
 * Resolved server URLs. `VITE_SERVER_URL` can be overridden at build time
 * to point at a Render/Fly/etc. backend; falls back to the local Colyseus
 * dev port otherwise.
 */
export const SERVER_URL: string =
  (import.meta.env.VITE_SERVER_URL as string | undefined) ?? 'ws://localhost:2567';

/** HTTP variant of SERVER_URL — used for /auth and /leaderboard endpoints. */
export const HTTP_URL: string = SERVER_URL.replace(/^ws/, 'http');
