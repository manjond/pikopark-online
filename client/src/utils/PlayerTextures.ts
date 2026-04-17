import Phaser from 'phaser';
import { PLAYER_COLORS, TILE_SIZE } from '@pikopark/shared';

/**
 * Generates a 4-frame spritesheet texture for a player color.
 * Frame size: TILE_SIZE × TILE_SIZE (32×32 at 1280×720).
 *
 * All pixel offsets are proportional via S = TILE_SIZE / 16 so the art
 * scales correctly when TILE_SIZE changes.
 *
 * Frames left→right:
 *   0 idle   — symmetric stance
 *   1 walk_a — left foot forward
 *   2 walk_b — right foot forward
 *   3 jump   — legs tucked, arms raised
 */
export function generatePlayerSpritesheet(
  scene: Phaser.Scene,
  colorIndex: number,
): void {
  const key = `player_sheet_${colorIndex}`;
  if (scene.textures.exists(key)) return;

  const color = PLAYER_COLORS[colorIndex] ?? 0xff3333;
  const W = TILE_SIZE;
  const H = TILE_SIZE;
  const S = W / 16; // scale factor — 2 at TILE_SIZE=32

  const g = scene.add.graphics();

  for (let frame = 0; frame < 4; frame++) {
    const ox = frame * W;

    // ── Head + torso ──────────────────────────────────────────────────────────
    g.fillStyle(color, 1);
    g.fillRect(ox + 3 * S, 0, 10 * S, 11 * S);

    // ── White eye sockets ────────────────────────────────────────────────────
    g.fillStyle(0xffffff, 1);
    g.fillRect(ox + 4 * S, 3 * S, 2 * S, 2 * S); // left
    g.fillRect(ox + 9 * S, 3 * S, 2 * S, 2 * S); // right

    // ── Pupils ───────────────────────────────────────────────────────────────
    g.fillStyle(0x111111, 1);
    if (frame === 3) {
      // jump — pupils at top of eyes (looking up)
      g.fillRect(ox + 4 * S, 3 * S, 1 * S, 1 * S);
      g.fillRect(ox + 9 * S, 3 * S, 1 * S, 1 * S);
    } else {
      g.fillRect(ox + 5 * S, 4 * S, 1 * S, 1 * S);
      g.fillRect(ox + 10 * S, 4 * S, 1 * S, 1 * S);
    }

    // ── Darker shade on body sides for depth ─────────────────────────────────
    const dark = darkenColor(color);
    g.fillStyle(dark, 0.35);
    g.fillRect(ox + 3 * S, 6 * S, 1 * S, 5 * S);   // left edge
    g.fillRect(ox + 12 * S, 6 * S, 1 * S, 5 * S);  // right edge

    // ── Legs ─────────────────────────────────────────────────────────────────
    g.fillStyle(color, 1);
    switch (frame) {
      case 0: // idle
        g.fillRect(ox + 3 * S, 11 * S, 4 * S, 5 * S);
        g.fillRect(ox + 9 * S, 11 * S, 4 * S, 5 * S);
        break;
      case 1: // walk A — left leg forward
        g.fillRect(ox + 2 * S, 11 * S, 4 * S, 5 * S);
        g.fillRect(ox + 9 * S, 11 * S, 4 * S, 3 * S);
        break;
      case 2: // walk B — right leg forward
        g.fillRect(ox + 3 * S, 11 * S, 4 * S, 3 * S);
        g.fillRect(ox + 10 * S, 11 * S, 4 * S, 5 * S);
        break;
      case 3: // jump — legs tucked, arms raised
        g.fillRect(ox + 3 * S, 11 * S, 4 * S, 3 * S);
        g.fillRect(ox + 9 * S, 11 * S, 4 * S, 3 * S);
        g.fillRect(ox + 0, 3 * S, 3 * S, 5 * S);          // left arm
        g.fillRect(ox + 13 * S, 3 * S, 3 * S, 5 * S);     // right arm
        break;
    }
  }

  g.generateTexture(key, W * 4, H);
  g.destroy();

  // Register named frames
  const tex = scene.textures.get(key);
  tex.add('idle',   0,      0, 0, W, H);
  tex.add('walk_a', 0, W,      0, W, H);
  tex.add('walk_b', 0, W * 2,  0, W, H);
  tex.add('jump',   0, W * 3,  0, W, H);
}

/**
 * Registers the three animation clips for a color.
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

export function resolveAnimKey(
  colorIndex: number,
  velocityX: number,
  isGrounded: boolean,
): string {
  if (!isGrounded) return `player_jump_${colorIndex}`;
  if (Math.abs(velocityX) > 1) return `player_walk_${colorIndex}`;
  return `player_idle_${colorIndex}`;
}

/** Darkens a hex color by mixing with black at 50%. */
function darkenColor(color: number): number {
  const r = ((color >> 16) & 0xff) >> 1;
  const g = ((color >> 8) & 0xff) >> 1;
  const b = (color & 0xff) >> 1;
  return (r << 16) | (g << 8) | b;
}
