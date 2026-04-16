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
 * Player sprite driven entirely by server positions.
 * Used for ALL players — both local and remote.
 *
 * Why server-driven for local too?
 * Because the alternative (local Arcade Physics + server for remotes) means
 * the local player sees themselves at a different position than everyone else
 * sees them, since the two simulations diverge immediately.  For a cooperative
 * puzzle platformer, the 50 ms round-trip latency is imperceptible and full
 * consistency is far more valuable than zero-lag local prediction.
 */
export class Player {
  private readonly sprite: Phaser.GameObjects.Sprite;
  colorIndex: number;

  // Interpolation state
  private prevX: number;
  private prevY: number;
  private targetX: number;
  private targetY: number;
  private lerpAlpha = 1; // 1 = already at target on first frame

  // Animation state (set from server data)
  private velocityX = 0;
  private isGrounded = true;
  private prevGrounded = true;

  /** Fires once when the player leaves the ground — used for jump sound. */
  onJump: (() => void) | null = null;

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
   * Update the sprite's color and regenerate textures.
   * Called when playerList confirms the actual color for this player.
   */
  updateColor(colorIndex: number, scene: Phaser.Scene): void {
    if (colorIndex === this.colorIndex) return;
    this.colorIndex = colorIndex;
    generatePlayerSpritesheet(scene, colorIndex);
    registerPlayerAnims(scene, colorIndex);
    const sheetKey = `player_sheet_${colorIndex}`;
    this.sprite.setTexture(sheetKey, 'idle');
    this.sprite.play(resolveAnimKey(colorIndex, this.velocityX, this.isGrounded));
  }

  /**
   * Receive an authoritative server position snapshot.
   * Starts a lerp from the current visual position to the new target.
   */
  receiveServerPosition(
    x: number,
    y: number,
    velocityX: number,
    isGrounded: boolean,
  ): void {
    if (x !== this.targetX || y !== this.targetY) {
      this.prevX = this.sprite.x;
      this.prevY = this.sprite.y;
      this.targetX = x;
      this.targetY = y;
      this.lerpAlpha = 0;
    }
    this.prevGrounded = this.isGrounded;
    this.velocityX = velocityX;
    this.isGrounded = isGrounded;

    // Detect jump (was grounded → now airborne)
    if (this.prevGrounded && !isGrounded && this.onJump) {
      this.onJump();
    }
  }

  /** Advance interpolation and update animation. Call once per Phaser frame. */
  tick(delta: number): void {
    // Smooth lerp toward server target position
    this.lerpAlpha = Math.min(1, this.lerpAlpha + delta / TICK_MS);
    this.sprite.x = Phaser.Math.Linear(this.prevX, this.targetX, this.lerpAlpha);
    this.sprite.y = Phaser.Math.Linear(this.prevY, this.targetY, this.lerpAlpha);

    // Face direction of travel
    if (this.velocityX < -1) this.sprite.setFlipX(true);
    else if (this.velocityX > 1) this.sprite.setFlipX(false);

    // Animation
    const animKey = resolveAnimKey(this.colorIndex, this.velocityX, this.isGrounded);
    if (this.sprite.anims.currentAnim?.key !== animKey) {
      this.sprite.play(animKey);
    }
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
