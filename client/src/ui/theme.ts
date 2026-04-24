/**
 * Shared UI primitives used across scenes. Centralising these keeps the font
 * family definition and the button factory in one place so refactoring the
 * look of the game doesn't require touching every scene.
 */
import Phaser from 'phaser';

export const FONT = { fontFamily: '"Press Start 2P"' } as const;

/**
 * Creates the standard pixel-font button used in menus: label text that turns
 * white on hover and fires `onClick` on pointerdown.
 */
export function makeButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  color: string,
  onClick: () => void,
  fontSize: string = '20px',
): Phaser.GameObjects.Text {
  const btn = scene.add.text(x, y, label, {
    ...FONT, fontSize, color,
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });

  btn.on('pointerover', () => btn.setColor('#ffffff'));
  btn.on('pointerout',  () => btn.setColor(color));
  btn.on('pointerdown', onClick);
  return btn;
}
