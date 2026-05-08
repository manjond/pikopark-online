import Phaser from 'phaser';
import type { NetworkObject } from '../network/ColyseusClient';
import { playButtonPress, playDoorOpen } from '../utils/SoundSystem';

// Pressure button (hold to keep active)
const BTN_PRESSURE_OFF  = 0xff9900;  // orange — pressure button, not pressed
const BTN_PRESSURE_ON   = 0x00ff88;  // green  — pressed
// Latch button (stays active once pressed)
const BTN_LATCH_OFF     = 0x4488ff;  // blue   — latch button, not yet triggered
// BTN_LATCH_ON same as BTN_PRESSURE_ON — both turn green when active
const DOOR_COLOR        = 0xcc3333;  // red    — closed barrier
const EXIT_DOOR_FRAME   = 0x224466;  // dark blue — exit door frame
const EXIT_DOOR_OPEN    = 0x4488cc;  // blue glow — door is open/welcoming
const EXIT_DOOR_DONE    = 0x22cc66;  // green — all players inside
const LAVA_BASE         = 0xff5500;  // orange — lava body
const LAVA_HOT          = 0xffcc22;  // yellow — hot bubbles
const LAVA_DARK         = 0x882200;  // dark red — shadowed crust
const TRAP_INACTIVE     = 0x444444;  // grey — deactivated lava
const SPRING_BASE       = 0x22cc88;  // green  — spring body
const SPRING_ARROW      = 0xffffff;  // white  — arrow up indicator
const PLATFORM_FILL     = 0xc88c32;  // warm amber — moving platforms
const PLATFORM_STROKE   = 0x6a4010;
const FIREBAR_PIVOT     = 0x332222;
const FIREBAR_CORE      = 0xffcc22;
const FIREBAR_OUTER     = 0xff4400;
const CRUMBLE_FILL      = 0xa88060;
const CRUMBLE_STROKE    = 0x5a3a20;
const BOX_FILL          = 0xb87333;  // copper brown — wooden crate
const BOX_STROKE        = 0x6b3a1f;
const LAVA_WALL_BASE    = 0xff3300;  // bright red — moving lava wall
const LAVA_WALL_HOT     = 0xff8800;  // orange — hot streaks
const VINE_ROPE         = 0x5bc06b;
const VINE_LEAF         = 0x1f7a3a;
const SPIKE_FILL        = 0xd8d8e8;
const SPIKE_STROKE      = 0x4a4a5a;

export class InteractiveObject {
  private readonly scene: Phaser.Scene;
  private readonly rect: Phaser.GameObjects.Rectangle;
  readonly type: string;

  /** Exit door visual components */
  private goalLabel: Phaser.GameObjects.Text | null = null;
  private goalStar: Phaser.GameObjects.Sprite | null = null;   // repurposed: door glow
  private goalGlow: Phaser.GameObjects.Arc | null = null;
  private goalCountText: Phaser.GameObjects.Text | null = null;
  /** Small colored squares shown on the door for each player inside. */
  private goalPlayerDots: Phaser.GameObjects.Rectangle[] = [];

  /** Lava wall visual components */
  private lavaWallStrips: Phaser.GameObjects.Rectangle[] = [];

  /** Pushable box cross-brace graphic (moves with the box). */
  private boxGraphics: Phaser.GameObjects.Graphics | null = null;

  /** Button type flag: needed for correct sync color logic */
  private isLatchButton = false;
  /** Button pad — the top surface that physically depresses on activation. */
  private buttonPad: Phaser.GameObjects.Rectangle | null = null;
  /** Button body side fill — the dark "box" that shows depth. */
  private buttonBody: Phaser.GameObjects.Rectangle | null = null;
  /** Button label ("LOCK" / "HOLD"). */
  private buttonLabel: Phaser.GameObjects.Text | null = null;

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
  private vineGraphics: Phaser.GameObjects.Graphics | null = null;
  private spikeGraphics: Phaser.GameObjects.Graphics | null = null;

  constructor(
    scene: Phaser.Scene,
    data: NetworkObject,
    doorGroup?: Phaser.Physics.Arcade.StaticGroup,
  ) {
    this.scene = scene;
    this.type = data.type;

    if (data.type === 'button') {
      this.isLatchButton = !!data.latching;
      const padColor  = this.isLatchButton ? BTN_LATCH_OFF  : BTN_PRESSURE_OFF;
      const bodyColor = this.isLatchButton ? 0x223355       : 0x553300;

      // Invisible placeholder (physics rect kept for API compatibility)
      this.rect = scene.add.rectangle(data.x, data.y, data.width, data.height, 0, 0);

      // Anchor button visuals to the BOTTOM of the data rect so the button
      // sits flush on the floor surface regardless of the data center y.
      const floorY = data.y + data.height / 2; // bottom edge of the button hitbox
      const BODY_H = 12;
      const PAD_H  = 6;
      const bodyCY = floorY - BODY_H / 2;        // body sits on the floor
      const PAD_UP_Y = bodyCY - BODY_H / 2 - 1;  // pad raised: just above body top

      // Body — the dark "housing" embedded in the floor
      this.buttonBody = scene.add.rectangle(data.x, bodyCY, data.width, BODY_H, bodyColor);
      this.buttonBody.setDepth(2);

      // Pad — the coloured top surface that physically depresses on activation
      this.buttonPad = scene.add.rectangle(data.x, PAD_UP_Y, data.width - 4, PAD_H, padColor);
      this.buttonPad.setStrokeStyle(1, 0xffffff, 0.3);
      this.buttonPad.setDepth(3);

      // Label above button (LOCK vs HOLD)
      const labelStr   = this.isLatchButton ? 'LOCK' : 'HOLD';
      const labelColor = this.isLatchButton ? '#88aaff' : '#ffaa44';
      this.buttonLabel = scene.add.text(data.x, PAD_UP_Y - PAD_H / 2 - 4, labelStr, {
        fontSize: '5px', color: labelColor, fontFamily: '"Press Start 2P"',
      }).setOrigin(0.5, 1).setDepth(4);

    } else if (data.type === 'goal') {
      // ── Exit door — tall door frame with glow ─────────────────────────────
      const doorW = Math.max(data.width, 40);
      const doorH = Math.max(data.height * 2, 80);
      this.rect = scene.add.rectangle(data.x, data.y, doorW, doorH, EXIT_DOOR_FRAME);
      this.rect.setStrokeStyle(3, EXIT_DOOR_OPEN);
      this.rect.setDepth(2);

      // Pulsing glow behind the door frame
      this.goalGlow = scene.add.circle(data.x, data.y, doorW * 0.8, EXIT_DOOR_OPEN, 0.15);
      this.goalGlow.setDepth(1);
      scene.tweens.add({
        targets: this.goalGlow,
        alpha: { from: 0.08, to: 0.30 },
        scaleX: { from: 0.9, to: 1.1 },
        scaleY: { from: 0.9, to: 1.1 },
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // "↑ E" enter hint above the door
      this.goalLabel = scene.add.text(data.x, data.y - doorH / 2 - 14, '↑ E', {
        fontFamily: '"Press Start 2P"',
        fontSize: '7px',
        color: '#88ccff',
      }).setOrigin(0.5, 1).setDepth(5);
      scene.tweens.add({
        targets: this.goalLabel,
        y: { from: data.y - doorH / 2 - 14, to: data.y - doorH / 2 - 20 },
        alpha: { from: 0.7, to: 1 },
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Player count text inside the door: "0/1"
      this.goalCountText = scene.add.text(data.x, data.y, '0/?', {
        fontFamily: '"Press Start 2P"',
        fontSize: '8px',
        color: '#ffffff',
      }).setOrigin(0.5).setDepth(6);

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

    } else if (data.type === 'lavawall') {
      // Main wall body — positioned initially, updated every tick via setLavaWallX
      this.rect = scene.add.rectangle(data.x, data.y, data.width, data.height, LAVA_WALL_BASE);
      this.rect.setDepth(5);
      // Hot streaks along the wall
      const streakCount = 5;
      for (let i = 0; i < streakCount; i++) {
        const sy = data.y - data.height / 2 + (data.height / streakCount) * (i + 0.3);
        const strip = scene.add.rectangle(data.x + data.width * 0.1, sy, data.width * 0.6, 4, LAVA_WALL_HOT, 0.8);
        strip.setDepth(6);
        scene.tweens.add({
          targets: strip,
          alpha: { from: 0.2, to: 0.9 },
          scaleX: { from: 0.4, to: 1 },
          duration: 300 + i * 80,
          delay: i * 60,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        this.lavaWallStrips.push(strip);
      }

    } else if (data.type === 'vine') {
      this.rect = scene.add.rectangle(data.x, data.y, data.width, data.height, 0, 0);
      const g = scene.add.graphics();
      g.lineStyle(4, VINE_ROPE, 0.95);
      g.strokeLineShape(new Phaser.Geom.Line(data.x, data.y - data.height / 2, data.x, data.y + data.height / 2));
      g.fillStyle(VINE_LEAF, 1);
      g.fillCircle(data.x, data.y - data.height / 2, 7);
      g.fillCircle(data.x - 6, data.y - data.height / 2 + 14, 5);
      g.fillCircle(data.x + 7, data.y - data.height / 2 + 28, 5);
      const dir = (data.speed ?? 560) < 0 ? -1 : 1;
      g.lineStyle(2, 0xffffff, 0.75);
      g.strokeLineShape(new Phaser.Geom.Line(data.x - dir * 10, data.y + data.height / 2 - 12, data.x + dir * 14, data.y + data.height / 2 - 12));
      g.fillTriangle(
        data.x + dir * 20, data.y + data.height / 2 - 12,
        data.x + dir * 10, data.y + data.height / 2 - 18,
        data.x + dir * 10, data.y + data.height / 2 - 6,
      );
      g.setDepth(3);
      this.vineGraphics = g;

    } else if (data.type === 'spike') {
      this.rect = scene.add.rectangle(data.x, data.y, data.width, data.height, 0, 0);
      const g = scene.add.graphics();
      const left = data.x - data.width / 2;
      const bottom = data.y + data.height / 2;
      const count = Math.max(2, Math.floor(data.width / 16));
      const spikeW = data.width / count;
      g.fillStyle(SPIKE_FILL, 1);
      g.lineStyle(1, SPIKE_STROKE, 1);
      for (let i = 0; i < count; i++) {
        const x = left + i * spikeW;
        g.fillTriangle(x, bottom, x + spikeW / 2, bottom - data.height, x + spikeW, bottom);
        g.strokeTriangle(x, bottom, x + spikeW / 2, bottom - data.height, x + spikeW, bottom);
      }
      g.setDepth(3);
      this.spikeGraphics = g;

    } else if (data.type === 'box') {
      // Wooden crate — visible rect with cross-brace that moves with it
      this.rect = scene.add.rectangle(data.x, data.y, data.width, data.height, BOX_FILL);
      this.rect.setStrokeStyle(3, BOX_STROKE);
      this.rect.setDepth(3);
      // Cross-brace: draw lines RELATIVE to graphic origin, then position graphic at box center.
      // When setBoxPosition is called, we move both rect and boxGraphics together.
      const g = scene.add.graphics();
      g.lineStyle(1.5, BOX_STROKE, 0.7);
      const hw = data.width  / 2;
      const hh = data.height / 2;
      g.strokeLineShape(new Phaser.Geom.Line(-hw, -hh,  hw,  hh));
      g.strokeLineShape(new Phaser.Geom.Line( hw, -hh, -hw,  hh));
      g.setPosition(data.x, data.y);
      g.setDepth(4);
      this.boxGraphics = g;

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

  /** Pad resting Y — stored at construction so sync animations reference it correctly. */
  private buttonPadRestY = 0;

  sync(data: Pick<NetworkObject, 'activated'>): void {
    if (this.type === 'button' && this.buttonPad) {
      const pad = this.buttonPad;
      // Use stored rest position, not pad.y which may have been tweened already
      if (this.buttonPadRestY === 0) this.buttonPadRestY = pad.y;
      const PAD_RAISED_Y  = this.buttonPadRestY;
      const PAD_PRESSED_Y = PAD_RAISED_Y + 7;  // sinks into the body

      if (data.activated && !this.prevActivated) {
        playButtonPress();
        this.scene.tweens.killTweensOf(pad);
        this.scene.tweens.add({ targets: pad, y: PAD_PRESSED_Y, duration: 60, ease: 'Sine.easeIn' });
        pad.setFillStyle(BTN_PRESSURE_ON);
        this.buttonBody?.setFillStyle(this.isLatchButton ? 0x114422 : 0x224400);
      } else if (!data.activated && this.prevActivated && !this.isLatchButton) {
        // Pressure button springs back
        this.scene.tweens.killTweensOf(pad);
        this.scene.tweens.add({ targets: pad, y: PAD_RAISED_Y, duration: 120, ease: 'Back.easeOut' });
        pad.setFillStyle(BTN_PRESSURE_OFF);
        this.buttonBody?.setFillStyle(0x553300);
      }
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

  /** Update lava wall position — called from lavaWallPositions broadcast. */
  setLavaWallX(x: number): void {
    if (this.type !== 'lavawall') return;
    this.rect.x = x;
    this.lavaWallStrips.forEach((s) => { s.x = x + this.rect.width * 0.1; });
  }

  /** Update pushable box position — called from boxPositions broadcast. */
  setBoxPosition(x: number, y: number): void {
    if (this.type !== 'box') return;
    this.rect.x = x;
    this.rect.y = y;
    if (this.boxGraphics) {
      this.boxGraphics.x = x;
      this.boxGraphics.y = y;
    }
  }

  /**
   * Update the exit door count display.
   * Call whenever `exitStates` changes.
   */
  setExitCount(inside: number, total: number): void {
    if (this.type !== 'goal' || !this.goalCountText) return;
    this.goalCountText.setText(`${inside}/${total}`);
    const allIn = inside >= total && total > 0;
    this.rect.setFillStyle(allIn ? EXIT_DOOR_DONE : EXIT_DOOR_FRAME);
    this.rect.setStrokeStyle(3, allIn ? EXIT_DOOR_DONE : EXIT_DOOR_OPEN);
    if (this.goalGlow) this.goalGlow.setFillStyle(allIn ? EXIT_DOOR_DONE : EXIT_DOOR_OPEN, 0.15);
  }

  /** Show colored player dots stacked inside the exit door. */
  setInsideColors(colors: number[]): void {
    if (this.type !== 'goal') return;
    // Destroy old dots
    this.goalPlayerDots.forEach((d) => d.destroy());
    this.goalPlayerDots = [];
    // Draw one 8×8 dot per player inside, stacked vertically
    const DOT = 8;
    const startY = this.rect.y - (colors.length - 1) * (DOT + 2) / 2;
    colors.forEach((color, i) => {
      const dot = this.scene.add.rectangle(
        this.rect.x, startY + i * (DOT + 2), DOT, DOT, color,
      );
      dot.setDepth(7);
      this.goalPlayerDots.push(dot);
    });
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
    } else if (phase === 'gone') {
      this.rect.setVisible(false);
      this.rect.setAlpha(0);
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
    if (this.buttonPad)  { this.scene.tweens.killTweensOf(this.buttonPad);  this.buttonPad.destroy(); }
    if (this.buttonBody) { this.buttonBody.destroy(); }
    if (this.buttonLabel) { this.buttonLabel.destroy(); }

    if (this.goalStar)       { this.scene.tweens.killTweensOf(this.goalStar);       this.goalStar.destroy(); }
    if (this.goalGlow)       { this.scene.tweens.killTweensOf(this.goalGlow);       this.goalGlow.destroy(); }
    if (this.goalLabel)      { this.scene.tweens.killTweensOf(this.goalLabel);      this.goalLabel.destroy(); }
    if (this.goalCountText)  { this.goalCountText.destroy(); }
    this.goalPlayerDots.forEach((d) => d.destroy());
    this.goalPlayerDots = [];
    if (this.springArrow)    { this.scene.tweens.killTweensOf(this.springArrow);    this.springArrow.destroy(); }
    if (this.lavaTopStrip)   { this.scene.tweens.killTweensOf(this.lavaTopStrip);   this.lavaTopStrip.destroy(); }
    this.lavaBubbles.forEach((b) => { this.scene.tweens.killTweensOf(b); b.destroy(); });
    this.lavaWallStrips.forEach((s) => { this.scene.tweens.killTweensOf(s); s.destroy(); });
    this.lavaWallStrips = [];
    if (this.vineGraphics) { this.vineGraphics.destroy(); this.vineGraphics = null; }
    if (this.spikeGraphics) { this.spikeGraphics.destroy(); this.spikeGraphics = null; }
    if (this.boxGraphics) { this.boxGraphics.destroy(); this.boxGraphics = null; }

    if (this.fireBarPivot) { this.fireBarPivot.destroy(); this.fireBarPivot = null; }
    this.fireBarSegments.forEach((s) => { this.scene.tweens.killTweensOf(s); s.destroy(); });
    this.fireBarSegments = [];

    this.doorImg?.destroy();
  }
}
