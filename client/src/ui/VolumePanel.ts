/**
 * Small click-to-cycle music-volume widget. Shows a speaker icon plus a
 * 4-bar level meter. Clicking advances through OFF → LOW → MED → FULL and
 * then back to OFF. Persists via SoundSystem's setMusicVolume().
 *
 * The component is scene-agnostic — hand it a scene + anchor (x, y) and it
 * renders a Container you can further reposition with setScrollFactor(0)
 * if you need it pinned to the viewport.
 */
import Phaser from 'phaser';
import { getMusicVolume, setMusicVolume } from '../utils/SoundSystem';
import { FONT } from './theme';

const STEPS = [0, 0.33, 0.66, 1];

export class VolumePanel {
  readonly container: Phaser.GameObjects.Container;
  private readonly bars: Phaser.GameObjects.Rectangle[] = [];
  private readonly label: Phaser.GameObjects.Text;
  private stepIdx = STEPS.length - 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.container = scene.add.container(x, y);

    // Speaker icon — three stacked triangles (crude but distinctive)
    const icon = scene.add.text(0, 0, '♪', {
      ...FONT, fontSize: '14px', color: '#ffffff',
    }).setOrigin(0, 0.5);
    this.container.add(icon);

    // 4 level bars, shortest to tallest
    const barX = 18;
    for (let i = 0; i < 4; i++) {
      const h = 3 + i * 3;  // 3, 6, 9, 12 px
      const bar = scene.add.rectangle(barX + i * 5, 0, 3, h, 0xffffff);
      bar.setOrigin(0, 0.5);
      this.container.add(bar);
      this.bars.push(bar);
    }

    // Hidden label shown when muted
    this.label = scene.add.text(barX + 24, 0, '', {
      ...FONT, fontSize: '8px', color: '#ffffff',
    }).setOrigin(0, 0.5);
    this.container.add(this.label);

    // Seed state from persisted volume
    const current = getMusicVolume();
    this.stepIdx = this.closestStep(current);
    this.applyStep(true);

    // Make the whole container clickable
    const hit = scene.add.rectangle(0, 0, 48, 20, 0x000000, 0)
      .setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => this.cycle());
    this.container.add(hit);
  }

  private closestStep(v: number): number {
    let best = 0;
    let bestDist = Infinity;
    STEPS.forEach((s, i) => {
      const d = Math.abs(s - v);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return best;
  }

  private cycle(): void {
    this.stepIdx = (this.stepIdx + 1) % STEPS.length;
    this.applyStep(false);
  }

  private applyStep(skipPersist: boolean): void {
    const v = STEPS[this.stepIdx]!;
    if (!skipPersist) setMusicVolume(v);
    else setMusicVolume(v); // always persist — cheap + keeps storage in sync

    // Color bars based on current step
    this.bars.forEach((bar, i) => {
      const on = i < this.stepIdx;
      bar.setFillStyle(on ? 0xffffff : 0x333333);
    });
    this.label.setText(this.stepIdx === 0 ? 'MUTE' : '');
  }

  destroy(): void {
    this.container.destroy();
  }
}
