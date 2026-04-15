import Phaser from 'phaser';
import type { NetworkObject } from '../network/ColyseusClient';
import { playButtonPress, playDoorOpen } from '../utils/SoundSystem';

const BUTTON_INACTIVE = 0xffff00;  // yellow — waiting for player
const BUTTON_ACTIVE   = 0x00ff88;  // green  — pressed
const DOOR_COLOR      = 0xcc3333;  // red    — closed barrier
const GOAL_COLOR      = 0xffd700;  // gold   — level exit star

export class InteractiveObject {
  private readonly scene: Phaser.Scene;
  private readonly rect: Phaser.GameObjects.Rectangle;
  readonly type: string;

  /** Physics image used for local player collision (doors only). */
  private doorImg: Phaser.Physics.Arcade.Image | null = null;

  constructor(
    scene: Phaser.Scene,
    data: NetworkObject,
    doorGroup?: Phaser.Physics.Arcade.StaticGroup,
  ) {
    this.scene = scene;
    this.type = data.type;

    if (data.type === 'button') {
      this.rect = scene.add.rectangle(data.x, data.y, data.width, data.height, BUTTON_INACTIVE);
      this.rect.setDepth(2);

    } else if (data.type === 'goal') {
      // Gold pulsing star — marks the level exit
      this.rect = scene.add.rectangle(data.x, data.y, data.width, data.height, GOAL_COLOR);
      this.rect.setDepth(2);
      // Pulse alpha so it stands out
      scene.tweens.add({
        targets: this.rect,
        alpha: { from: 0.5, to: 1 },
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

    } else {
      // Door — full-height barrier
      this.rect = scene.add.rectangle(data.x, data.y, data.width, data.height, DOOR_COLOR);
      this.rect.setDepth(0);

      if (doorGroup) {
        this.doorImg = doorGroup.create(
          data.x, data.y, 'door_body',
        ) as Phaser.Physics.Arcade.Image;
        this.doorImg.setDisplaySize(data.width, data.height);
        (this.doorImg.body as Phaser.Physics.Arcade.StaticBody).setSize(data.width, data.height);
        this.doorImg.refreshBody();
        this.doorImg.setAlpha(0);
      }
    }
  }

  private prevActivated = false;

  sync(data: NetworkObject): void {
    if (data.type === 'button') {
      if (data.activated && !this.prevActivated) playButtonPress();
      this.rect.setFillStyle(data.activated ? BUTTON_ACTIVE : BUTTON_INACTIVE);
    } else if (data.type === 'door') {
      if (data.activated && !this.prevActivated) playDoorOpen();
      this.rect.setVisible(!data.activated);
      if (this.doorImg?.body) {
        this.doorImg.body.enable = !data.activated;
      }
    }
    // goal has no sync state — always visible and pulsing
    this.prevActivated = data.activated;
  }

  destroy(): void {
    this.scene.tweens.killTweensOf(this.rect);
    this.rect.destroy();
    this.doorImg?.destroy();
  }
}
