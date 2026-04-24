import Phaser from 'phaser';
import { FONT, makeButton } from '../ui/theme';
import { HTTP_URL } from '../network/endpoints';
import {
  GAME_WIDTH, GAME_HEIGHT, TILE_SIZE,
  type LevelData, type SolidRect, type LevelObjectDef, type SpawnPoint,
  type TileType,
} from '@pikopark/shared';
import { loadStoredAccount } from './AuthScene';

type Tool = 'select' | 'ground' | 'platform' | 'spawn' | 'goal' | 'delete';

const TOOL_ORDER: Tool[] = ['select', 'ground', 'platform', 'spawn', 'goal', 'delete'];
const TOOL_LABELS: Record<Tool, string> = {
  select: 'SELECT',
  ground: 'GROUND',
  platform: 'PLATFORM',
  spawn: 'SPAWN',
  goal: 'GOAL',
  delete: 'DELETE',
};
const TOOL_COLORS: Record<Tool, string> = {
  select: '#cccccc',
  ground: '#8b5a2b',
  platform: '#00aa66',
  spawn: '#ffcc66',
  goal: '#ffff00',
  delete: '#ff4466',
};
const TOOL_KEYS: Record<Tool, string> = {
  select: '1', ground: '2', platform: '3', spawn: '4', goal: '5', delete: '6',
};

const GRID = TILE_SIZE; // snap step
const FLOOR_Y = 688;    // matches _helpers.FLOOR_TOP (ground surface)

interface EditorDoc {
  id: number;          // 0 = new unsaved doc; server assigns on first save
  name: string;
  minPlayers: number;
  mapWidth: number;
  solidRects: SolidRect[];
  spawnPoints: SpawnPoint[];
  objects: LevelObjectDef[];
}

/**
 * Admin-only level editor. Grid-snapped placement for terrain/spawns/goal.
 * Keeps state in a local `EditorDoc`, renders via a single Container so a
 * single repaint() call covers every edit — simpler than trying to patch
 * individual sprites. The canvas always reflects doc state; tool and
 * viewport are the only hidden state.
 *
 * Scope (MVP): terrain rects + spawns + goal. Buttons/doors/traps are a
 * follow-up — they need ID management + link-picking UI that's out of scope
 * for the first commit.
 */
export class EditorScene extends Phaser.Scene {
  private doc!: EditorDoc;
  private tool: Tool = 'ground';

  private worldLayer!: Phaser.GameObjects.Container;
  private gridGfx!: Phaser.GameObjects.Graphics;
  private contentGfx!: Phaser.GameObjects.Graphics;
  private previewGfx!: Phaser.GameObjects.Graphics;

  private topBar!: Phaser.GameObjects.Rectangle;
  private bottomBar!: Phaser.GameObjects.Rectangle;
  private infoText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private toolButtons = new Map<Tool, Phaser.GameObjects.Text>();

  private dragStart: { x: number; y: number } | null = null;
  private cameraOffsetX = 0;

  constructor() {
    super({ key: 'EditorScene' });
  }

  create(): void {
    // Re-verify admin role on entry — the MenuScene gate is cosmetic, the
    // server is the only real authority (and will 403 on save anyway).
    const acct = loadStoredAccount();
    if (acct?.role !== 'admin') {
      this.scene.start('MenuScene');
      return;
    }

    this.doc = blankDoc();
    this.cameraOffsetX = 0;

    // ── World layer (everything that scrolls) ─────────────────────────────
    this.worldLayer = this.add.container(0, 0);
    this.gridGfx = this.add.graphics();
    this.contentGfx = this.add.graphics();
    this.previewGfx = this.add.graphics();
    this.worldLayer.add([this.gridGfx, this.contentGfx, this.previewGfx]);

    // ── UI bars (fixed to screen) ─────────────────────────────────────────
    this.topBar = this.add.rectangle(0, 0, GAME_WIDTH, 48, 0x000000, 0.75)
      .setOrigin(0, 0).setScrollFactor(0);
    this.bottomBar = this.add.rectangle(0, GAME_HEIGHT - 36, GAME_WIDTH, 36, 0x000000, 0.75)
      .setOrigin(0, 0).setScrollFactor(0);

    // Tool palette across the top
    TOOL_ORDER.forEach((t, i) => {
      const x = 16 + i * 130;
      const btn = this.add.text(x, 24, `[${TOOL_KEYS[t]}] ${TOOL_LABELS[t]}`, {
        ...FONT, fontSize: '11px', color: TOOL_COLORS[t],
      }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => { if (this.tool !== t) btn.setColor('#ffffff'); });
      btn.on('pointerout',  () => btn.setColor(this.tool === t ? '#ffffff' : TOOL_COLORS[t]));
      btn.on('pointerdown', () => this.selectTool(t));
      this.toolButtons.set(t, btn);
    });

    // Top-right: save / new / back
    makeButton(this, GAME_WIDTH - 60,  24, 'BACK', '#888888', () => this.exitToMenu(), '12px');
    makeButton(this, GAME_WIDTH - 140, 24, 'NEW',  '#ffaa44', () => this.confirmNew(), '12px');
    makeButton(this, GAME_WIDTH - 230, 24, 'SAVE', '#00ff88', () => { void this.save(); }, '12px');

    // Bottom: document info + status line
    this.infoText = this.add.text(16, GAME_HEIGHT - 18, '', {
      ...FONT, fontSize: '10px', color: '#ffcc66',
    }).setOrigin(0, 0.5).setScrollFactor(0).setInteractive({ useHandCursor: true });
    this.infoText.on('pointerdown', () => this.editMetadata());

    this.statusText = this.add.text(GAME_WIDTH - 16, GAME_HEIGHT - 18, '', {
      ...FONT, fontSize: '10px', color: '#888888',
    }).setOrigin(1, 0.5).setScrollFactor(0);

    // Pin UI layers above world
    this.topBar.setDepth(100);
    this.bottomBar.setDepth(100);
    this.toolButtons.forEach(b => b.setDepth(101));
    this.infoText.setDepth(101);
    this.statusText.setDepth(101);

    // ── Input ─────────────────────────────────────────────────────────────
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.onPointerDown(p));
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.onPointerMove(p));
    this.input.on('pointerup',   (p: Phaser.Input.Pointer) => this.onPointerUp(p));

    this.input.keyboard!.on('keydown', this.onKeyDown, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard!.off('keydown', this.onKeyDown, this);
    });

    this.selectTool('ground');
    this.setStatus('Drag to paint a ground rect. 1–6 switches tools. M edits metadata.');
    this.repaint();
  }

  // ─── Document lifecycle ───────────────────────────────────────────────────

  private async save(): Promise<void> {
    if (!this.doc.name.trim()) {
      this.editMetadata();
      this.setStatus('Name the level first, then SAVE again.', '#ff6666');
      return;
    }
    if (this.doc.objects.filter(o => o.type === 'goal').length === 0) {
      this.setStatus('Add a GOAL before saving.', '#ff6666');
      return;
    }
    if (this.doc.spawnPoints.length === 0) {
      this.setStatus('Add at least one SPAWN before saving.', '#ff6666');
      return;
    }

    const acct = loadStoredAccount();
    if (!acct || !acct.password || acct.role !== 'admin') {
      this.setStatus('Not authorised — log in again as admin.', '#ff6666');
      return;
    }

    const level: LevelData = {
      id: this.doc.id || Date.now() % 1_000_000, // stable-ish id for custom levels
      name: this.doc.name,
      minPlayers: this.doc.minPlayers,
      mapWidth: this.doc.mapWidth,
      solidRects: this.doc.solidRects,
      spawnPoints: this.doc.spawnPoints,
      objects: this.doc.objects,
    };

    this.setStatus('Saving...', '#ffff00');
    try {
      const res = await fetch(`${HTTP_URL}/admin/levels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: acct.username,
          password: acct.password,
          level,
        }),
      });
      const body = await res.json() as { level?: { slug: string }; error?: string };
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      this.doc.id = level.id;
      this.setStatus(`Saved as "${body.level?.slug ?? this.doc.name}".`, '#00ff88');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown error';
      console.warn('[EditorScene] save failed:', msg);
      this.setStatus(`Save failed: ${msg}`, '#ff6666');
    }
  }

  private confirmNew(): void {
    if (!confirm('Discard this level and start a new one?')) return;
    this.doc = blankDoc();
    this.cameraOffsetX = 0;
    this.repaint();
    this.setStatus('New level. Drag to paint terrain.');
  }

  private exitToMenu(): void {
    this.scene.start('MenuScene');
  }

  private editMetadata(): void {
    const name = prompt('Level name:', this.doc.name);
    if (name === null) return;
    const minStr = prompt('Minimum players (1-8):', String(this.doc.minPlayers));
    if (minStr === null) return;
    const widthStr = prompt('Map width in pixels (>= 1280):', String(this.doc.mapWidth));
    if (widthStr === null) return;

    const minP = Math.max(1, Math.min(8, Math.floor(Number(minStr) || 1)));
    const w = Math.max(GAME_WIDTH, Math.round((Number(widthStr) || GAME_WIDTH) / GRID) * GRID);
    this.doc.name = name.trim().slice(0, 40);
    this.doc.minPlayers = minP;
    this.doc.mapWidth = w;
    this.repaint();
  }

  // ─── Tool + input ─────────────────────────────────────────────────────────

  private selectTool(t: Tool): void {
    this.tool = t;
    this.toolButtons.forEach((btn, key) => {
      btn.setColor(key === t ? '#ffffff' : TOOL_COLORS[key]);
    });
    this.previewGfx.clear();
    this.dragStart = null;
    this.setStatus(hintFor(t));
  }

  private onPointerDown(p: Phaser.Input.Pointer): void {
    if (p.y < 48 || p.y > GAME_HEIGHT - 36) return; // UI strip
    const { x, y } = this.toWorld(p);
    if (this.tool === 'ground' || this.tool === 'platform') {
      this.dragStart = snap(x, y);
    } else if (this.tool === 'spawn') {
      this.doc.spawnPoints.push({ x: snapX(x), y: Math.min(snapY(y), FLOOR_Y - TILE_SIZE / 2) });
      this.repaint();
    } else if (this.tool === 'goal') {
      // Replace any existing goal — level can only have one.
      this.doc.objects = this.doc.objects.filter(o => o.type !== 'goal');
      this.doc.objects.push({
        id: 'goal',
        type: 'goal',
        x: snapX(x), y: snapY(y),
        width: TILE_SIZE, height: TILE_SIZE,
        requiredPlayers: 0,
        linkedId: '',
      });
      this.repaint();
    } else if (this.tool === 'delete') {
      this.deleteAt(x, y);
    }
  }

  private onPointerMove(p: Phaser.Input.Pointer): void {
    if (!this.dragStart) return;
    const { x, y } = this.toWorld(p);
    const rect = rectFromDrag(this.dragStart, { x: snapX(x), y: snapY(y) });
    this.previewGfx.clear();
    const color = this.tool === 'platform' ? 0x00aa66 : 0x8b5a2b;
    this.previewGfx.fillStyle(color, 0.5);
    this.previewGfx.fillRect(rect.x, rect.y, rect.width, rect.height);
    this.previewGfx.lineStyle(2, 0xffffff, 0.7);
    this.previewGfx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  }

  private onPointerUp(p: Phaser.Input.Pointer): void {
    if (!this.dragStart) return;
    const start = this.dragStart;
    this.dragStart = null;
    this.previewGfx.clear();
    if (this.tool !== 'ground' && this.tool !== 'platform') return;
    const { x, y } = this.toWorld(p);
    const rect = rectFromDrag(start, { x: snapX(x), y: snapY(y) });
    if (rect.width < GRID || rect.height < GRID) return;
    const tileType: TileType = this.tool === 'ground' ? 'ground' : 'platform';
    this.doc.solidRects.push({ ...rect, tileType });
    this.repaint();
  }

  private onKeyDown(e: KeyboardEvent): void {
    // Tool hotkeys
    for (const t of TOOL_ORDER) {
      if (e.key === TOOL_KEYS[t]) { this.selectTool(t); return; }
    }
    if (e.key === 'Escape') { this.exitToMenu(); return; }
    if (e.key === 'm' || e.key === 'M') { this.editMetadata(); return; }
    if (e.key === 'ArrowLeft')  { this.pan(-GRID * 4); return; }
    if (e.key === 'ArrowRight') { this.pan( GRID * 4); return; }
  }

  // ─── Hit-test / erase ─────────────────────────────────────────────────────

  private deleteAt(x: number, y: number): void {
    // Prefer removing objects first, then spawns, then solid rects.
    const obj = this.doc.objects.find(o => containsPoint(
      { x: o.x - o.width / 2, y: o.y - o.height / 2, width: o.width, height: o.height }, x, y,
    ));
    if (obj) {
      this.doc.objects = this.doc.objects.filter(o => o !== obj);
      this.repaint();
      return;
    }
    const sp = this.doc.spawnPoints.findIndex(s =>
      Math.abs(s.x - x) <= TILE_SIZE / 2 && Math.abs(s.y - y) <= TILE_SIZE / 2,
    );
    if (sp >= 0) {
      this.doc.spawnPoints.splice(sp, 1);
      this.repaint();
      return;
    }
    const rect = this.doc.solidRects.find(r => containsPoint(r, x, y));
    if (rect) {
      this.doc.solidRects = this.doc.solidRects.filter(r => r !== rect);
      this.repaint();
    }
  }

  // ─── Viewport / panning ───────────────────────────────────────────────────

  private pan(dx: number): void {
    const maxOffset = Math.max(0, this.doc.mapWidth - GAME_WIDTH);
    this.cameraOffsetX = Phaser.Math.Clamp(this.cameraOffsetX + dx, 0, maxOffset);
    this.worldLayer.x = -this.cameraOffsetX;
    this.updateInfo();
  }

  private toWorld(p: Phaser.Input.Pointer): { x: number; y: number } {
    return { x: p.worldX + this.cameraOffsetX, y: p.worldY };
  }

  // ─── Rendering ────────────────────────────────────────────────────────────

  private repaint(): void {
    this.worldLayer.x = -this.cameraOffsetX;
    // Grid
    this.gridGfx.clear();
    this.gridGfx.fillStyle(0x0e1424, 1);
    this.gridGfx.fillRect(0, 0, this.doc.mapWidth, GAME_HEIGHT);
    this.gridGfx.lineStyle(1, 0x2a3150, 0.5);
    for (let x = 0; x <= this.doc.mapWidth; x += GRID) {
      this.gridGfx.lineBetween(x, 0, x, GAME_HEIGHT);
    }
    for (let y = 0; y <= GAME_HEIGHT; y += GRID) {
      this.gridGfx.lineBetween(0, y, this.doc.mapWidth, y);
    }
    // Floor reference line
    this.gridGfx.lineStyle(2, 0x556688, 0.8);
    this.gridGfx.lineBetween(0, FLOOR_Y, this.doc.mapWidth, FLOOR_Y);

    // Content
    this.contentGfx.clear();
    for (const r of this.doc.solidRects) {
      const color = r.tileType === 'ground' ? 0x8b5a2b : 0x00aa66;
      this.contentGfx.fillStyle(color, 1);
      this.contentGfx.fillRect(r.x, r.y, r.width, r.height);
      this.contentGfx.lineStyle(1, 0xffffff, 0.15);
      this.contentGfx.strokeRect(r.x, r.y, r.width, r.height);
    }
    for (const sp of this.doc.spawnPoints) {
      this.contentGfx.fillStyle(0xffcc66, 0.9);
      this.contentGfx.fillCircle(sp.x, sp.y, TILE_SIZE / 2);
      this.contentGfx.lineStyle(2, 0xffffff, 1);
      this.contentGfx.strokeCircle(sp.x, sp.y, TILE_SIZE / 2);
    }
    for (const o of this.doc.objects) {
      if (o.type === 'goal') {
        this.contentGfx.fillStyle(0xffff00, 1);
        this.contentGfx.fillRect(o.x - o.width / 2, o.y - o.height / 2, o.width, o.height);
        this.contentGfx.lineStyle(2, 0xffffff, 1);
        this.contentGfx.strokeRect(o.x - o.width / 2, o.y - o.height / 2, o.width, o.height);
      }
    }

    this.updateInfo();
  }

  private updateInfo(): void {
    const g = this.doc.objects.filter(o => o.type === 'goal').length;
    this.infoText.setText(
      `"${this.doc.name || '(unnamed)'}"  min=${this.doc.minPlayers}  w=${this.doc.mapWidth}  ` +
      `rects=${this.doc.solidRects.length}  spawns=${this.doc.spawnPoints.length}  goals=${g}  ` +
      `scroll=${this.cameraOffsetX}  [click to edit]`,
    );
  }

  private setStatus(msg: string, color = '#888888'): void {
    this.statusText.setText(msg).setColor(color);
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function blankDoc(): EditorDoc {
  return {
    id: 0,
    name: '',
    minPlayers: 1,
    mapWidth: GAME_WIDTH,
    solidRects: [
      // Default floor strip — matches every stock level's ground row.
      { x: 0, y: FLOOR_Y, width: GAME_WIDTH, height: GAME_HEIGHT - FLOOR_Y, tileType: 'ground' },
    ],
    spawnPoints: [],
    objects: [],
  };
}

function snap(x: number, y: number): { x: number; y: number } {
  return { x: snapX(x), y: snapY(y) };
}
function snapX(x: number): number { return Math.round(x / GRID) * GRID; }
function snapY(y: number): number { return Math.round(y / GRID) * GRID; }

function rectFromDrag(
  a: { x: number; y: number }, b: { x: number; y: number },
): { x: number; y: number; width: number; height: number } {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const width = Math.max(GRID, Math.abs(b.x - a.x));
  const height = Math.max(GRID, Math.abs(b.y - a.y));
  return { x, y, width, height };
}

function containsPoint(
  r: { x: number; y: number; width: number; height: number }, px: number, py: number,
): boolean {
  return px >= r.x && px <= r.x + r.width && py >= r.y && py <= r.y + r.height;
}

function hintFor(t: Tool): string {
  switch (t) {
    case 'select':   return 'Select: pan with arrow keys.';
    case 'ground':   return 'Ground: drag to paint a solid block (lands-on + blocks sideways).';
    case 'platform': return 'Platform: drag to paint a one-way platform (land from above).';
    case 'spawn':    return 'Spawn: click to place a spawn point.';
    case 'goal':     return 'Goal: click to place the gold goal (level has one).';
    case 'delete':   return 'Delete: click on an object to remove it.';
  }
}
