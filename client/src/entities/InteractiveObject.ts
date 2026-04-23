import Phaser from 'phaser';
import type { NetworkObject } from '../network/ColyseusClient';
import { playButtonPress, playDoorOpen } from '../utils/SoundSystem';

const BUTTON_INACTIVE = 0xffff00;  // yellow — waiting for player
const BUTTON_ACTIVE   = 0x00ff88;  // green  — pressed
const DOOR_COLOR      = 0xcc3333;  // red    — closed barrier
const TRAP_ACTIVE     = 0xff2200;  // red-orange — dangerous spikes
const TRAP_INACTIVE   = 0x444444;  // grey — deactivated trap
const SPRING_BASE     = 0x22cc88;  // green  — spring body
const SPRING_ARROW    = 0xffffff;  // white  — arrow up indicator
const PLATFORM_FILL   = 0xc88c32;  // warm amber — moving platforms stand out vs grey static tiles
const PLATFORM_STROKE = 0x6a4010;

export class InteractiveObject {
  private readonly scene: Phaser.Scene;
  private readonly rect: Phaser.GameObjects.Rectangle;
  readonly type: string;

  /** Goal visual components */
  private goalLabel: Phaser.GameObjects.Text | null = null;
  private goalStar: Phaser.GameObjects.Sprite | null = null;
  private goalGlow: Phaser.GameObjects.Arc | null = null;

  /** Physics image used for local player collision (doors only). */
  private doorImg: Phaser.Physics.Arcade.Image | null = null;

  /** Optional arrow glyph drawn on top of a spring pad. */
  private springArrow: Phaser.GameObjects.Triangle | null = null;

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
      // Invisible placeholder rect to satisfy the readonly field requirement
      this.rect = scene.add.rectangle(data.x, data.y, data.width, data.height, 0, 0);

      // ── Glow circle behind the star ─────────────────────────────────────────
      this.goalGlow = scene.add.circle(data.x, data.y, 22, 0xffd700, 0.3);
      this.goalGlow.setDepth(1);
      scene.tweens.add({
        targets: this.goalGlow,
        alpha: { from: 0.12, to: 0.48 },
        scaleX: { from: 0.8, to: 1.2 },
        scaleY: { from: 0.8, to: 1.2 },
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // ── 5-pointed gold star texture (generated once per scene lifetime) ─────
      const starKey = 'goal_star';
      if (!scene.textures.exists(starKey)) {
        const g = scene.add.graphics();
        const outerR = 13;
        const innerR  = 5;
        const cx = 16;
        const cy = 16;
        const pts: { x: number; y: number }[] = [];
        for (let i = 0; i < 10; i++) {
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const r = i % 2 === 0 ? outerR : innerR;
          pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
        }
        g.fillStyle(0xffd700, 1);
        g.fillPoints(pts, true);
        g.lineStyle(1.5, 0xffffff, 0.7);
        g.strokePoints(pts, true);
        g.generateTexture(starKey, 32, 32);
        g.destroy();
      }

      this.goalStar = scene.add.sprite(data.x, data.y, starKey);
      this.goalStar.setDepth(3);
      scene.tweens.add({
        targets: this.goalStar,
        angle: 360,
        duration: 2400,
        repeat: -1,
        ease: 'Linear',
      });

      // ── "GOAL" floating label ───────────────────────────────────────────────
      this.goalLabel = scene.add.text(data.x, data.y - 26, 'GOAL', {
        fontFamily: '"Press Start 2P"',
        fontSize: '5px',
        color: '#ffd700',
      }).setOrigin(0.5, 0.5).setDepth(4);
      scene.tweens.add({
        targets: this.goalLabel,
        alpha: { from: 0.55, to: 1 },
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

    } else if (data.type === 'trap') {
      this.rect = scene.add.rectangle(data.x, data.y, data.width, data.height, TRAP_ACTIVE);
      this.rect.setDepth(0);

    } else if (data.type === 'platform') {
      this.rect = scene.add.rectangle(data.x, data.y, data.width, data.height, PLATFORM_FILL);
      this.rect.setStrokeStyle(2, PLATFORM_STROKE);
      this.rect.setDepth(1);

    } else if (data.type === 'spring') {
      this.rect = scene.add.rectangle(data.x, data.y, data.width, data.height, SPRING_BASE);
      this.rect.setStrokeStyle(1, 0x115533);
      this.rect.setDepth(2);

      // Small white upward triangle centred on the pad as a "launch" hint.
      const ax = data.x;
      const ay = data.y;
      const w = Math.min(data.width * 0.5, 20);
      const h = Math.min(data.height * 0.9, 12);
      this.springArrow = scene.add.triangle(
        ax, ay,
        0, h / 2,
        w, h / 2,
        w / 2, -h / 2,
        SPRING_ARROW,
      );
      this.springArrow.setDepth(3);

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

  sync(data: Pick<NetworkObject, 'activated'>): void {
    if (this.type === 'button') {
      if (data.activated && !this.prevActivated) playButtonPress();
      this.rect.setFillStyle(data.activated ? BUTTON_ACTIVE : BUTTON_INACTIVE);
    } else if (this.type === 'door') {
      if (data.activated && !this.prevActivated) playDoorOpen();
      this.rect.setVisible(!data.activated);
      if (this.doorImg?.body) {
        this.doorImg.body.enable = !data.activated;
      }
    } else if (this.type === 'trap') {
      this.rect.setFillStyle(data.activated ? TRAP_INACTIVE : TRAP_ACTIVE);
      this.rect.setAlpha(data.activated ? 0.35 : 1);
    }
    // goal/spring have no sync state — goal spins, spring animates on bounce
    this.prevActivated = data.activated;
  }

  /** Update a moving platform's rendered position — called from platformPositions. */
  setPosition(x: number, y: number): void {
    this.rect.x = x;
    this.rect.y = y;
  }

  /** Play a brief squash animation on the spring pad (called on bounce). */
  playBounceAnim(): void {
    if (this.type !== 'spring') return;
    this.scene.tweens.killTweensOf(this.rect);
    if (this.springArrow) this.scene.tweens.killTweensOf(this.springArrow);

    this.rect.setScale(1, 1);
    this.scene.tweens.add({
      targets: this.rect,
      scaleY: { from: 0.55, to: 1 },
      duration: 220,
      ease: 'Back.easeOut',
    });
    if (this.springArrow) {
      this.scene.tweens.add({
        targets: this.springArrow,
        y: { from: this.springArrow.y - 6, to: this.springArrow.y },
        duration: 220,
        ease: 'Back.easeOut',
      });
    }
  }

  destroy(): void {
    this.scene.tweens.killTweensOf(this.rect);
    this.rect.destroy();

    if (this.goalStar)    { this.scene.tweens.killTweensOf(this.goalStar);    this.goalStar.destroy(); }
    if (this.goalGlow)    { this.scene.tweens.killTweensOf(this.goalGlow);    this.goalGlow.destroy(); }
    if (this.goalLabel)   { this.scene.tweens.killTweensOf(this.goalLabel);   this.goalLabel.destroy(); }
    if (this.springArrow) { this.scene.tweens.killTweensOf(this.springArrow); this.springArrow.destroy(); }

    this.doorImg?.destroy();
  }
}
