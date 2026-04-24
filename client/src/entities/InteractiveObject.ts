import Phaser from 'phaser';
import type { NetworkObject } from '../network/ColyseusClient';
import { playButtonPress, playDoorOpen } from '../utils/SoundSystem';

const BUTTON_INACTIVE = 0xffff00;  // yellow — waiting for player
const BUTTON_ACTIVE   = 0x00ff88;  // green  — pressed
const DOOR_COLOR      = 0xcc3333;  // red    — closed barrier
const LAVA_BASE       = 0xff5500;  // orange — lava body
const LAVA_HOT        = 0xffcc22;  // yellow — hot bubbles
const LAVA_DARK       = 0x882200;  // dark red — shadowed crust
const TRAP_INACTIVE   = 0x444444;  // grey — deactivated lava (after button press)
const SPRING_BASE     = 0x22cc88;  // green  — spring body
const SPRING_ARROW    = 0xffffff;  // white  — arrow up indicator
const PLATFORM_FILL   = 0xc88c32;  // warm amber — moving platforms stand out vs grey static tiles
const PLATFORM_STROKE = 0x6a4010;
const FIREBAR_PIVOT   = 0x332222;
const FIREBAR_CORE    = 0xffcc22;
const FIREBAR_OUTER   = 0xff4400;
const CRUMBLE_FILL    = 0xa88060;
const CRUMBLE_STROKE  = 0x5a3a20;

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

  /** Fire bar: pivot center (x,y), segment count, and the rotating segment graphics. */
  private fireBarSegments: Phaser.GameObjects.Arc[] = [];
  private fireBarPivot: Phaser.GameObjects.Arc | null = null;
  private fireBarCenterX = 0;
  private fireBarCenterY = 0;
  private fireBarSegmentCount = 0;

  /** Crumble: current phase string + the visible rect (hidden when falling/respawning). */
  private crumblePhase = 'intact';

  /** Lava visual extras — bubble arcs that pulse while the trap is active. */
  private lavaBubbles: Phaser.GameObjects.Arc[] = [];
  private lavaTopStrip: Phaser.GameObjects.Rectangle | null = null;

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
      // Main lava body — sits flush with the floor band (helpers put its top
      // just a few pixels above FLOOR_TOP so collision still triggers).
      this.rect = scene.add.rectangle(data.x, data.y, data.width, data.height, LAVA_BASE);
      this.rect.setStrokeStyle(1, LAVA_DARK);
      this.rect.setDepth(2);

      // Hot yellow crust along the top edge — sells the "molten surface" look.
      const topY = data.y - data.height / 2 + 2;
      this.lavaTopStrip = scene.add.rectangle(data.x, topY, data.width, 3, LAVA_HOT);
      this.lavaTopStrip.setDepth(3);
      scene.tweens.add({
        targets: this.lavaTopStrip,
        alpha: { from: 0.5, to: 1 },
        duration: 500 + Math.random() * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // A few bubbles drifting up along the strip.
      const bubbleCount = Math.max(2, Math.floor(data.width / 24));
      for (let i = 0; i < bubbleCount; i++) {
        const bx = data.x - data.width / 2 + ((i + 0.5) * data.width) / bubbleCount;
        const by = data.y - data.height / 4;
        const r = 2 + Math.random() * 2;
        const b = scene.add.circle(bx, by, r, LAVA_HOT, 0.9);
        b.setDepth(4);
        scene.tweens.add({
          targets: b,
          y: { from: by + 2, to: by - 4 },
          alpha: { from: 0, to: 1 },
          scaleX: { from: 0.4, to: 1 },
          scaleY: { from: 0.4, to: 1 },
          duration: 700 + Math.random() * 400,
          delay: i * 120,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        this.lavaBubbles.push(b);
      }

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

    } else if (data.type === 'firebar') {
      // Invisible anchor rect so `this.rect` is always a Rectangle.
      this.rect = scene.add.rectangle(data.x, data.y, 1, 1, 0, 0);
      this.fireBarCenterX = data.x;
      this.fireBarCenterY = data.y;
      this.fireBarSegmentCount = Math.max(1, Math.min(8, data.segments ?? 3));

      this.fireBarPivot = scene.add.circle(data.x, data.y, 6, FIREBAR_PIVOT);
      this.fireBarPivot.setDepth(3);

      const TILE = 32;
      for (let i = 0; i < this.fireBarSegmentCount; i++) {
        const distance = (i + 0.5) * TILE;
        const circle = scene.add.circle(
          data.x + distance,
          data.y,
          TILE * 0.45,
          FIREBAR_OUTER,
        );
        circle.setDepth(3);
        // Inner hot core
        scene.tweens.add({
          targets: circle,
          alpha: { from: 0.85, to: 1 },
          duration: 200 + i * 40,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        this.fireBarSegments.push(circle);
      }
      // Small inner core overlay on each segment
      for (let i = 0; i < this.fireBarSegmentCount; i++) {
        const distance = (i + 0.5) * TILE;
        const inner = scene.add.circle(
          data.x + distance,
          data.y,
          TILE * 0.22,
          FIREBAR_CORE,
        );
        inner.setDepth(4);
        this.fireBarSegments.push(inner);
      }

    } else if (data.type === 'crumble') {
      this.rect = scene.add.rectangle(data.x, data.y, data.width, data.height, CRUMBLE_FILL);
      this.rect.setStrokeStyle(2, CRUMBLE_STROKE);
      this.rect.setDepth(1);

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
      const cooled = data.activated; // linked button is held — lava hardens
      this.rect.setFillStyle(cooled ? TRAP_INACTIVE : LAVA_BASE);
      this.rect.setAlpha(cooled ? 0.4 : 1);
      this.lavaTopStrip?.setVisible(!cooled);
      this.lavaBubbles.forEach((b) => b.setVisible(!cooled));
    }
    // goal/spring have no sync state — goal spins, spring animates on bounce
    this.prevActivated = data.activated;
  }

  /** Update a moving platform's rendered position — called from platformPositions. */
  setPosition(x: number, y: number): void {
    this.rect.x = x;
    this.rect.y = y;
  }

  /** Rotate fire-bar segments to the given pivot angle (radians). */
  setFireBarAngle(angle: number): void {
    if (this.type !== 'firebar') return;
    const TILE = 32;
    const segCount = this.fireBarSegmentCount;
    for (let i = 0; i < this.fireBarSegments.length; i++) {
      const distance = ((i % segCount) + 0.5) * TILE;
      this.fireBarSegments[i].x = this.fireBarCenterX + Math.cos(angle) * distance;
      this.fireBarSegments[i].y = this.fireBarCenterY + Math.sin(angle) * distance;
    }
  }

  /** Apply a crumble phase change (server broadcasts on phase transitions). */
  setCrumblePhase(phase: string): void {
    if (this.type !== 'crumble') return;
    if (phase === this.crumblePhase) return;
    this.crumblePhase = phase;
    this.scene.tweens.killTweensOf(this.rect);
    this.rect.setScale(1, 1);
    this.rect.setAlpha(1);
    this.rect.x = this.rect.x; // no-op to silence unused warnings on some builds

    if (phase === 'intact') {
      this.rect.setVisible(true);
      this.rect.setFillStyle(CRUMBLE_FILL);
    } else if (phase === 'shaking') {
      this.rect.setVisible(true);
      this.scene.tweens.add({
        targets: this.rect,
        scaleX: { from: 0.97, to: 1.03 },
        duration: 60,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    } else if (phase === 'falling') {
      this.rect.setVisible(false);
    } else if (phase === 'respawning') {
      this.rect.setVisible(true);
      this.rect.setAlpha(0.35);
    }
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
    if (this.lavaTopStrip) { this.scene.tweens.killTweensOf(this.lavaTopStrip); this.lavaTopStrip.destroy(); }
    this.lavaBubbles.forEach((b) => { this.scene.tweens.killTweensOf(b); b.destroy(); });

    if (this.fireBarPivot) { this.fireBarPivot.destroy(); this.fireBarPivot = null; }
    this.fireBarSegments.forEach((s) => { this.scene.tweens.killTweensOf(s); s.destroy(); });
    this.fireBarSegments = [];

    this.doorImg?.destroy();
  }
}
