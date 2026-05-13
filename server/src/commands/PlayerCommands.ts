import { Client } from 'colyseus';
import { GameState } from '../state/GameState';
import { InputMessage, MOVE_SPEED, JUMP_VELOCITY, TILE_SIZE } from '@pikopark/shared';

const INPUT_DT = 1 / 60;
const GROUND_ACCEL = 5200;
const GROUND_DECEL = 6400;
const AIR_ACCEL = 3600;
const AIR_DECEL = 2200;
const ICE_DECEL = 420;

export function handlePlayerInput(
  state: GameState,
  client: Client,
  input: InputMessage,
): void {
  const player = state.players.get(client.sessionId);
  if (!player) return;

  // Being carried: ignore all movement/jump input. Interact is still recorded
  // (so the carried player could theoretically use it for future mechanics),
  // but velocity is pinned to the carrier by the tick loop.
  if (player.carriedBy) {
    player.velocityX = 0;
    player.animation = 'carried';
    player.isInteracting = input.interact;
    return;
  }

  // Horizontal movement: ease toward the target instead of snapping instantly.
  // This keeps controls responsive while removing the heavy/stuttery feel.
  const moveDir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (moveDir !== 0) player.facing = moveDir;

  const targetVX = moveDir * MOVE_SPEED;
  const accel = player.isGrounded
    ? moveDir === 0 && player.onIce
      ? ICE_DECEL
      : moveDir === 0
        ? GROUND_DECEL
        : GROUND_ACCEL
    : moveDir === 0
      ? AIR_DECEL
      : AIR_ACCEL;
  player.velocityX = approach(player.velocityX, targetVX, accel * INPUT_DT);
  if (Math.abs(player.velocityX) < 2) player.velocityX = 0;
  player.animation = player.isGrounded
    ? Math.abs(player.velocityX) > 12 ? 'walk' : 'idle'
    : 'jump';

  // Jump - only if grounded AND no player is standing on this player's head.
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

function approach(current: number, target: number, maxDelta: number): number {
  if (current < target) return Math.min(current + maxDelta, target);
  if (current > target) return Math.max(current - maxDelta, target);
  return current;
}
