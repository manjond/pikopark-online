import { Schema, type, MapSchema } from '@colyseus/schema';
import { PlayerState } from './Player';

export class ObjectState extends Schema {
  @type('string') id: string = '';
  /** 'button' | 'door' | 'goal' | 'trap' | 'spring' | 'platform' */
  @type('string') type: string = 'button';
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') width: number = 16;
  @type('number') height: number = 16;
  @type('boolean') activated: boolean = false;
  @type('number') requiredPlayers: number = 1;
  @type('string') linkedId: string = '';
  /** When true the button stays activated after the first trigger instead of resetting each tick. */
  @type('boolean') latching: boolean = false;

  /**
   * Spring launch velocity (px/s, negative=upward). Also reused as rotation
   * rate (rad/s) for fire bars. Server-only; not synced through schema —
   * bounces go via 'springBounce' and fire-bar angles via 'firebarAngles'.
   */
  power: number = 0;

  // ── Fire bar (server-only) ────────────────────────────────────────────────
  /** Number of fire segments radiating from the pivot. */
  segments: number = 0;
  /** Current rotation angle in radians — advanced each tick by `power`. */
  angle: number = 0;

  // ── Crumbling platform (server-only) ──────────────────────────────────────
  /** 'intact' | 'shaking' | 'falling' | 'respawning'. Drives client visuals. */
  crumblePhase: string = 'intact';
  /** Milliseconds remaining in the current crumble phase. */
  crumbleTimer: number = 0;

  // ── Moving-platform motion (server-only — not synced through schema, but
  //     broadcast every tick via the 'platformPositions' message). ─────────
  /** '' | 'x' | 'y' */
  motionAxis: string = '';
  motionFrom: number = 0;
  motionTo: number = 0;
  motionSpeed: number = 0;
  /** Oscillation phase in ms — used to compute current position. */
  motionPhase: number = 0;
  /** Last frame's velocity along the motion axis — used to carry riders. */
  platformVX: number = 0;
  platformVY: number = 0;
  /** Last frame's position on the motion axis — used to compute velocity. */
  private prevMotionPos: number = 0;
  /** Tracks whether prevMotionPos has been initialised. */
  private prevMotionPosInit: boolean = false;

  // ── Lava wall (server-only) ───────────────────────────────────────────────
  /** px/s speed the lava wall moves (positive = rightward). */
  lavaWallSpeed: number = 0;
  /** Current X position of the lava wall's right edge. */
  lavaWallX: number = 0;

  // ── Pushable box (server-only) ────────────────────────────────────────────
  boxVX: number = 0;
  boxVY: number = 0;
  /** Whether crumble should NOT respawn. */
  noRespawn: boolean = false;

  /**
   * Advance motion by `dtMs` and update x/y, plus velocities for riders.
   * Safe to call on non-moving platforms (no-op).
   */
  tickMotion(dtMs: number): void {
    if (!this.motionAxis) return;
    const dist = Math.abs(this.motionTo - this.motionFrom);
    if (dist === 0 || this.motionSpeed === 0) return;
    const cycleMs = (dist * 2 / this.motionSpeed) * 1000;
    this.motionPhase = (this.motionPhase + dtMs) % cycleMs;
    const progress = this.motionPhase / cycleMs;   // 0..1
    const t = progress < 0.5 ? progress * 2 : 2 - progress * 2; // triangle 0..1..0
    const pos = this.motionFrom + t * (this.motionTo - this.motionFrom);

    if (!this.prevMotionPosInit) { this.prevMotionPos = pos; this.prevMotionPosInit = true; }
    const v = dtMs > 0 ? (pos - this.prevMotionPos) * (1000 / dtMs) : 0;
    this.prevMotionPos = pos;

    if (this.motionAxis === 'x') { this.x = pos; this.platformVX = v; this.platformVY = 0; }
    else { this.y = pos; this.platformVX = 0; this.platformVY = v; }
  }
}

export class GameState extends Schema {
  @type('string') roomCode: string = '';
  /** 'waiting' | 'playing' | 'completed' */
  @type('string') status: string = 'waiting';
  @type('number') currentLevel: number = 0;
  @type({ map: PlayerState }) players: MapSchema<PlayerState> =
    new MapSchema<PlayerState>();
  @type({ map: ObjectState }) interactiveObjects: MapSchema<ObjectState> =
    new MapSchema<ObjectState>();
}
