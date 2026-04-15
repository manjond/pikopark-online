import Phaser from 'phaser';
import { PLAYER_COLORS, TILE_SIZE } from '@pikopark/shared';

/**
 * Generates a 4-frame (64×16) spritesheet texture for a single player color.
 * Texture key: `player_sheet_N` (N = colorIndex).
 *
 * Frames left→right:
 *   0 idle   — symmetric stance
 *   1 walk_a — left foot forward
 *   2 walk_b — right foot forward
 *   3 jump   — legs tucked, arms raised
 *
 * The sprite faces RIGHT by default; flip X to face left.
 */
export function generatePlayerSpritesheet(
  scene: Phaser.Scene,
  colorIndex: number,
): void {
  const key = `player_sheet_${colorIndex}`;
  if (scene.textures.exists(key)) return;

  const color = PLAYER_COLORS[colorIndex] ?? 0xff0000;
  const W = TILE_SIZE; // 16
  const H = TILE_SIZE; // 16

  const g = scene.add.graphics();

  for (let frame = 0; frame < 4; frame++) {
    const ox = frame * W;

    // ── Head + torso (main color, 10 px wide × 11 px tall) ──────────────────
    g.fillStyle(color, 1);
    g.fillRect(ox + 3, 0, 10, 11);

    // ── Eyes — white background ──────────────────────────────────────────────
    g.fillStyle(0xffffff, 1);
    g.fillRect(ox + 4, 3, 2, 2); // left
    g.fillRect(ox + 9, 3, 2, 2); // right

    // ── Pupils — look up during jump ─────────────────────────────────────────
    g.fillStyle(0x111111, 1);
    if (frame === 3) {
      // looking up — pupils at top of eye
      g.fillRect(ox + 4, 3, 1, 1);
      g.fillRect(ox + 9, 3, 1, 1);
    } else {
      // looking forward — pupils at center of eye
      g.fillRect(ox + 5, 4, 1, 1);
      g.fillRect(ox + 10, 4, 1, 1);
    }

    // ── Legs (vary by frame) ─────────────────────────────────────────────────
    g.fillStyle(color, 1);
    switch (frame) {
      case 0: // idle
        g.fillRect(ox + 3, 11, 4, 5);  // left leg
        g.fillRect(ox + 9, 11, 4, 5);  // right leg
        break;

      case 1: // walk A — left forward
        g.fillRect(ox + 2, 11, 4, 5);  // left leg (extended)
        g.fillRect(ox + 9, 11, 4, 3);  // right leg (tucked)
        break;

      case 2: // walk B — right forward
        g.fillRect(ox + 3, 11, 4, 3);  // left leg (tucked)
        g.fillRect(ox + 10, 11, 4, 5); // right leg (extended)
        break;

      case 3: // jump — legs tucked, arms up
        g.fillRect(ox + 3, 11, 4, 3);  // left leg short
        g.fillRect(ox + 9, 11, 4, 3);  // right leg short
        g.fillRect(ox + 0, 3, 3, 5);   // left arm raised
        g.fillRect(ox + 13, 3, 3, 5);  // right arm raised
        break;
    }
  }

  g.generateTexture(key, W * 4, H);
  g.destroy();

  // Register named frames for Phaser's animation system
  const tex = scene.textures.get(key);
  tex.add('idle',   0,       0, 0, W, H);
  tex.add('walk_a', 0, W,     0, W, H);
  tex.add('walk_b', 0, W * 2, 0, W, H);
  tex.add('jump',   0, W * 3, 0, W, H);
}

/**
 * Registers the three animation clips (idle, walk, jump) for a color.
 * Idempotent — safe to call multiple times.
 */
export function registerPlayerAnims(
  scene: Phaser.Scene,
  colorIndex: number,
): void {
  const key = `player_sheet_${colorIndex}`;

  if (!scene.anims.exists(`player_idle_${colorIndex}`)) {
    scene.anims.create({
      key: `player_idle_${colorIndex}`,
      frames: [{ key, frame: 'idle' }],
      frameRate: 1,
      repeat: -1,
    });
  }

  if (!scene.anims.exists(`player_walk_${colorIndex}`)) {
    scene.anims.create({
      key: `player_walk_${colorIndex}`,
      frames: [
        { key, frame: 'walk_a' },
        { key, frame: 'walk_b' },
      ],
      frameRate: 8,
      repeat: -1,
    });
  }

  if (!scene.anims.exists(`player_jump_${colorIndex}`)) {
    scene.anims.create({
      key: `player_jump_${colorIndex}`,
      frames: [{ key, frame: 'jump' }],
      frameRate: 1,
      repeat: -1,
    });
  }
}

/**
 * Returns the animation key appropriate for the current movement state.
 * The caller should check `currentAnim.key !== result` before playing
 * to avoid restarting an animation that's already running.
 */
export function resolveAnimKey(
  colorIndex: number,
  velocityX: number,
  isGrounded: boolean,
): string {
  if (!isGrounded) return `player_jump_${colorIndex}`;
  if (Math.abs(velocityX) > 1) return `player_walk_${colorIndex}`;
  return `player_idle_${colorIndex}`;
}
