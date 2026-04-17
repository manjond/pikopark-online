import { Client } from 'colyseus';
import { GameState } from '../state/GameState';
import { InputMessage, MOVE_SPEED, JUMP_VELOCITY, TILE_SIZE } from '@pikopark/shared';

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

  // Jump — only if grounded AND no player is standing on this player's head
  if (input.jump && player.isGrounded) {
    let playerOnTop = false;
    const myHead = player.y - TILE_SIZE / 2;
    state.players.forEach((other) => {
      if (other === player) return;
      const otherFeet = other.y + TILE_SIZE / 2;
      const horizOverlap = Math.abs(other.x - player.x) < TILE_SIZE * 0.9;
      if (horizOverlap && Math.abs(otherFeet - myHead) < TILE_SIZE * 0.3) {
        playerOnTop = true;
      }
    });

    if (!playerOnTop) {
      player.velocityY = JUMP_VELOCITY;
      player.isGrounded = false;
      player.animation = 'jump';
    }
  }

  player.isInteracting = input.interact;
}
