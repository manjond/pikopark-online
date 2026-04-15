import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // No external assets yet — pixel art is generated in-game.
  }

  create(): void {
    // Wait for the Google Font to load before starting the menu so text
    // is rendered correctly on first frame.
    document.fonts.ready
      .then(() => this.scene.start('MenuScene'))
      .catch(() => this.scene.start('MenuScene')); // start anyway on failure
  }
}
