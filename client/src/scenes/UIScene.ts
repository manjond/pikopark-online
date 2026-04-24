import Phaser from 'phaser';
import { FONT } from '../ui/theme';
import { VolumePanel } from '../ui/VolumePanel';
import { GAME_WIDTH } from '@pikopark/shared';

const HUD_FONT = { ...FONT, fontSize: '7px' };

/**
 * The HUD overlay launched by GameScene. Pins player count + connection
 * status in the top-left, and volume + exit controls in the top-right.
 *
 * EXIT is emitted via the shared game-level events bus so GameScene can
 * listen from its own lifecycle without UIScene needing a direct reference.
 */
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

    // ── Top-right: exit + volume ────────────────────────────────────────────
    const exit = this.add.text(GAME_WIDTH - 6, 6, 'EXIT', {
      ...HUD_FONT, fontSize: '10px', color: '#ff6666',
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    exit.on('pointerover', () => exit.setColor('#ffffff'));
    exit.on('pointerout',  () => exit.setColor('#ff6666'));
    exit.on('pointerdown', () => { this.game.events.emit('hud:exit'); });

    // VolumePanel sits just under EXIT, right-aligned.
    new VolumePanel(this, GAME_WIDTH - 60, 26);
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
