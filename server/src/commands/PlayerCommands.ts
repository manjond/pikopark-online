import { Client } from 'colyseus';
import { GameState } from '../state/GameState';
import { InputMessage, MOVE_SPEED, JUMP_VELOCITY } from '@pikopark/shared';

export function handlePlayerInput(
  state: GameState,
  client: Client,
  input: InputMessage,
): void {
  const player = state.players.get(client.sessionId);
  if (!player) return;

  // Horizontal movement
  if (input.left) {
    player.velocityX = -MOVE_SPEED;
    player.animation = 'walk';
  } else if (input.right) {
    player.velocityX = MOVE_SPEED;
    player.animation = 'walk';
  } else {
    player.velocityX = 0;
    player.animation = 'idle';
  }

  // Jump — only if grounded
  if (input.jump && player.isGrounded) {
    player.velocityY = JUMP_VELOCITY;
    player.isGrounded = false;
    player.animation = 'jump';
  }

  player.isInteracting = input.interact;
}
