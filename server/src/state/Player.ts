import { Schema, type } from '@colyseus/schema';

export class PlayerState extends Schema {
  @type('string') id: string = '';
  @type('string') name: string = '';
  @type('number') color: number = 0;
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('number') velocityX: number = 0;
  @type('number') velocityY: number = 0;
  @type('boolean') isGrounded: boolean = false;
  @type('boolean') isInteracting: boolean = false;
  @type('string') animation: string = 'idle';

  // ── Pickup/throw mechanic ──────────────────────────────────────────────────
  /** Session id of the player carrying us (''=free). Riders do not integrate physics. */
  @type('string') carriedBy: string = '';
  /** Session id of the player we are carrying (''=not carrying). */
  @type('string') carrying: string = '';

  // ── Server-only bookkeeping (not sent through schema) ──────────────────────
  /** Previous-tick interact state, used to detect press edges. */
  prevInteract: boolean = false;
  /** Last non-zero walk direction, +1 right / -1 left. Used as throw facing. */
  facing: number = 1;
}
