import Phaser from 'phaser';
import { FONT } from '../ui/theme';

const HUD_FONT = { ...FONT, fontSize: '7px' };

export class UIScene extends Phaser.Scene {
  private playerCountText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    this.playerCountText = this.add.text(6, 6, 'Players: 1', {
      ...HUD_FONT, color: '#ffffff',
    });

    this.statusText = this.add.text(6, 18, 'Connecting...', {
      ...HUD_FONT, color: '#ffff00',
    });

  }

  updatePlayerCount(count: number): void {
    this.playerCountText?.setText(`Players: ${count}`);
  }

  /** Called when the WebSocket room join succeeds. */
  setConnected(roomCode: string): void {
    this.statusText?.setColor('#00ff88').setText(`Room: ${roomCode}`);
  }

  /** Called when the server is unreachable. */
  setOffline(): void {
    this.statusText?.setColor('#ff8800').setText('Offline');
  }
}
