import Phaser from 'phaser';
import { TICK_RATE } from '@pikopark/shared';
import {
  generatePlayerSpritesheet,
  registerPlayerAnims,
  resolveAnimKey,
} from '../utils/PlayerTextures';

/** Duration of one server tick in ms — used as the lerp window. */
const TICK_MS = 1000 / TICK_RATE; // 50 ms

/**
 * Remote player sprite that interpolates smoothly between server snapshots
 * and plays the correct animation based on received server state.
 */
export class Player {
  private readonly sprite: Phaser.GameObjects.Sprite;
  readonly colorIndex: number;

  // Interpolation state
  private prevX: number;
  private prevY: number;
  private targetX: number;
  private targetY: number;
  private lerpAlpha = 1; // starts at 1 → first position is exact

  // Animation state (derived from server velocity)
  private velocityX = 0;
  private isGrounded = true;

  constructor(scene: Phaser.Scene, x: number, y: number, colorIndex: number) {
    this.colorIndex = colorIndex;
    this.prevX = x;
    this.prevY = y;
    this.targetX = x;
    this.targetY = y;

    generatePlayerSpritesheet(scene, colorIndex);
    registerPlayerAnims(scene, colorIndex);

    const sheetKey = `player_sheet_${colorIndex}`;
    this.sprite = scene.add.sprite(x, y, sheetKey, 'idle');
    this.sprite.play(`player_idle_${colorIndex}`);
    this.sprite.setDepth(1);
  }

  /**
   * Called each frame with the latest server state for this player.
   * Position changes restart the lerp window for smooth movement.
   */
  receiveServerPosition(
    x: number,
    y: number,
    velocityX: number,
    isGrounded: boolean,
  ): void {
    if (x !== this.targetX || y !== this.targetY) {
      // Snapshot current visual position as the lerp start
      this.prevX = this.sprite.x;
      this.prevY = this.sprite.y;
      this.targetX = x;
      this.targetY = y;
      this.lerpAlpha = 0;
    }
    this.velocityX = velocityX;
    this.isGrounded = isGrounded;
  }

  /** Advance interpolation and update animation. Call once per frame. */
  tick(delta: number): void {
    // Advance lerp
    this.lerpAlpha = Math.min(1, this.lerpAlpha + delta / TICK_MS);
    this.sprite.x = Phaser.Math.Linear(this.prevX, this.targetX, this.lerpAlpha);
    this.sprite.y = Phaser.Math.Linear(this.prevY, this.targetY, this.lerpAlpha);

    // Flip to face movement direction
    if (this.velocityX < -1) this.sprite.setFlipX(true);
    else if (this.velocityX > 1) this.sprite.setFlipX(false);

    // Play animation matching movement state
    const animKey = resolveAnimKey(this.colorIndex, this.velocityX, this.isGrounded);
    if (this.sprite.anims.currentAnim?.key !== animKey) {
      this.sprite.play(animKey);
    }
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
