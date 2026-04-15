import Phaser from 'phaser';
import { MOVE_SPEED, JUMP_VELOCITY } from '@pikopark/shared';

export interface PhysicsConfig {
  moveSpeed: number;
  jumpVelocity: number;
}

const DEFAULT_CONFIG: PhysicsConfig = {
  moveSpeed: MOVE_SPEED,
  jumpVelocity: JUMP_VELOCITY,
};

/**
 * Apply directional movement and jump to an arcade physics body.
 * Called once per frame from a scene's update().
 *
 * @param jump - Should be a one-shot "just pressed" signal (e.g. from
 *   `Phaser.Input.Keyboard.JustDown`), not a continuous `isDown`, so the
 *   player cannot auto-jump by holding the key through a landing.
 */
export function applyMovement(
  body: Phaser.Physics.Arcade.Body,
  left: boolean,
  right: boolean,
  jump: boolean,
  config: PhysicsConfig = DEFAULT_CONFIG,
): void {
  if (left) {
    body.setVelocityX(-config.moveSpeed);
  } else if (right) {
    body.setVelocityX(config.moveSpeed);
  } else {
    body.setVelocityX(0);
  }

  if (jump && body.onFloor()) {
    body.setVelocityY(config.jumpVelocity);
  }
}
