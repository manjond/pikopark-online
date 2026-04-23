import Phaser from 'phaser';
import { loadStoredAccount } from './AuthScene';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // No external assets yet — pixel art is generated in-game.
  }

  create(): void {
    // Returning visitors with a cached account skip AuthScene entirely.
    const next = loadStoredAccount() !== null ? 'MenuScene' : 'AuthScene';
    document.fonts.ready
      .then(() => this.scene.start(next))
      .catch(() => this.scene.start(next));
  }
}
