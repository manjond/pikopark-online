import Phaser from 'phaser';
import { FONT, makeButton } from '../ui/theme';
import { HTTP_URL } from '../network/endpoints';
import {
  GAME_WIDTH, GAME_HEIGHT, TILE_SIZE,
  type LevelData, type SolidRect, type LevelObjectDef, type SpawnPoint,
  type TileType,
} from '@pikopark/shared';
import { loadStoredAccount } from './AuthScene';

/*
 * Drag-and-drop level editor for admin users.
 *
 * Layout:
 *   ┌────────────────────────────────────────────┐
 *   │              top bar (save/new/meta)        │
 *   ├──────┬──────────────────────────┬──────────┤
 *   │ tool │      world canvas        │ inspector│
 *   │ pal. │ (pan/zoom + drag-paint)  │ (select) │
 *   ├──────┴──────────────────────────┴──────────┤
 *   │                status bar                    │
 *   └──────────────────────────────────────────────┘
 *
 * Interaction model:
 *   SELECT tool  — click objects to select; drag body to move; drag
 *                  corner handles to resize; Delete key removes;
 *                  Ctrl+D duplicates. Inspector panel on the right
 *                  shows props (tile type, dims, firebar segments/speed,
 *                  motion range/speed, etc.) with ±/toggle controls.
 *   Paint tools  — drag in the canvas to paint a rect/object.
 *                  firebar/spawn/goal are click-to-place.
 *   Pan          — spacebar+drag OR middle-button drag OR wheel scroll.
 *   Undo/redo    — Ctrl+Z / Ctrl+Shift+Z or Ctrl+Y, up to UNDO_LIMIT snapshots.
 */

type Tool =
  | 'select' | 'ground' | 'platform' | 'ice'
  | 'spawn' | 'goal' | 'firebar' | 'crumble'
  | 'vplatform' | 'delete';

const TOOL_ORDER: Tool[] = [
  'select', 'ground', 'platform', 'ice',
  'spawn', 'goal', 'firebar', 'crumble',
  'vplatform', 'delete',
];

const TOOL_LABELS: Record<Tool, string> = {
  select: 'SELECT', ground: 'GROUND', platform: 'PLATFM', ice: 'ICE',
  spawn: 'SPAWN', goal: 'GOAL', firebar: 'FIRE', crumble: 'CRUMBLE',
  vplatform: 'V-PLAT', delete: 'DELETE',
};

const TOOL_COLORS: Record<Tool, number> = {
  select: 0x6688cc, ground: 0x8b5a2b, platform: 0x00aa66, ice: 0x9fd9ff,
  spawn: 0xffcc66, goal: 0xffff00, firebar: 0xff6622, crumble: 0xa88060,
  vplatform: 0xc88c32, delete: 0xff4466,
};

const TOOL_KEYS: Record<Tool, string> = {
  select: '1', ground: '2', platform: '3', ice: '4',
  spawn: '5', goal: '6', firebar: '7', crumble: '8',
  vplatform: '9', delete: '0',
};

const GRID = TILE_SIZE;
const FLOOR_Y = 688;

// Layout constants — panel widths + bar heights in screen-space.
const SIDEBAR_W   = 82;
const TOPBAR_H    = 40;
const STATUSBAR_H = 22;
const INSPECTOR_W = 220;

const TILE_SIZE_UI  = 64;     // sidebar tool tile size
const TILE_PAD_UI   = 6;
const HANDLE_SIZE   = 10;     // selection-handle square dimensions

type Selection =
  | { kind: 'rect'; index: number }
  | { kind: 'spawn'; index: number }
  | { kind: 'object'; index: number }
  | null;

type HandleKey = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

type DragMode =
  | { kind: 'none' }
  | { kind: 'paint'; start: { x: number; y: number } }
  | {
      kind: 'move';
      selRef: Selection;
      startWorld: { x: number; y: number };
      /** Initial center x/y for the selected item. */
      initial: { x: number; y: number };
    }
  | {
      kind: 'resize';
      selRef: Selection;
      handle: HandleKey;
      startWorld: { x: number; y: number };
      /** Initial bounds of the selection: top-left x/y + width/height. */
      initial: { x: number; y: number; width: number; height: number };
    }
  | { kind: 'pan'; startScreenX: number; initialOffset: number };

interface EditorDoc {
  id: number;
  name: string;
  minPlayers: number;
  mapWidth: number;
  solidRects: SolidRect[];
  spawnPoints: SpawnPoint[];
  objects: LevelObjectDef[];
}

export class EditorScene extends Phaser.Scene {
  private doc!: EditorDoc;
  private tool: Tool = 'select';
  private selection: Selection = null;
  private hover: Selection = null;

  // World layer — translated by -cameraOffsetX each repaint.
  private worldLayer!: Phaser.GameObjects.Container;
  private gridGfx!: Phaser.GameObjects.Graphics;
  private contentGfx!: Phaser.GameObjects.Graphics;
  private previewGfx!: Phaser.GameObjects.Graphics;
  private selectionGfx!: Phaser.GameObjects.Graphics;
  private hoverGfx!: Phaser.GameObjects.Graphics;

  private toolTiles = new Map<Tool, {
    bg: Phaser.GameObjects.Rectangle;
    label: Phaser.GameObjects.Text;
    swatch: Phaser.GameObjects.Rectangle;
  }>();

  private infoText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private inspectorTitle!: Phaser.GameObjects.Text;
  private inspectorHint!: Phaser.GameObjects.Text;
  private inspectorRows: Phaser.GameObjects.GameObject[] = [];

  // Camera / drag / keyboard state.
  private cameraOffsetX = 0;
  private drag: DragMode = { kind: 'none' };
  private spaceDown = false;

  // Undo/redo — snapshot-based, each entry is JSON of the doc.
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private readonly UNDO_LIMIT = 50;

  constructor() {
    super({ key: 'EditorScene' });
  }

  // ═══ Scene lifecycle ═══════════════════════════════════════════════════════

  create(): void {
    // Re-check admin role; server is still the authoritative gate.
    const acct = loadStoredAccount();
    if (acct?.role !== 'admin') { this.scene.start('MenuScene'); return; }

    this.doc = blankDoc();
    this.cameraOffsetX = 0;
    this.selection = null;
    this.hover = null;
    this.undoStack = [];
    this.redoStack = [];

    // World layer — everything in world coords goes here.
    this.worldLayer = this.add.container(SIDEBAR_W, TOPBAR_H);
    this.gridGfx       = this.add.graphics();
    this.contentGfx    = this.add.graphics();
    this.previewGfx    = this.add.graphics();
    this.hoverGfx      = this.add.graphics();
    this.selectionGfx  = this.add.graphics();
    this.worldLayer.add([this.gridGfx, this.contentGfx, this.previewGfx, this.hoverGfx, this.selectionGfx]);

    this.buildTopBar();
    this.buildSidebar();
    this.buildStatusBar();
    this.buildInspectorPanel();

    // Input
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.onPointerDown(p));
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.onPointerMove(p));
    this.input.on('pointerup',   (p: Phaser.Input.Pointer) => this.onPointerUp(p));
    this.input.on('wheel', (
      _p: Phaser.Input.Pointer,
      _over: Phaser.GameObjects.GameObject[],
      dx: number, dy: number,
    ) => { this.pan(dx + dy); });

    this.input.keyboard!.on('keydown', this.onKeyDown, this);
    this.input.keyboard!.on('keyup',   this.onKeyUp,   this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard!.off('keydown', this.onKeyDown, this);
      this.input.keyboard!.off('keyup',   this.onKeyUp,   this);
    });

    this.selectTool('select');
    this.setStatus('Tip: drag with SELECT to move; corners to resize. Space+drag pans.');
    this.repaint();
  }

  // ═══ Top bar ═══════════════════════════════════════════════════════════════

  private buildTopBar(): void {
    this.add.rectangle(0, 0, GAME_WIDTH, TOPBAR_H, 0x111625, 0.95)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(100);
    const rule = this.add.rectangle(0, TOPBAR_H, GAME_WIDTH, 1, 0x2a3150, 1)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(100);

    this.infoText = this.add.text(10, TOPBAR_H / 2, '', {
      ...FONT, fontSize: '10px', color: '#ffcc66',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101)
      .setInteractive({ useHandCursor: true });
    this.infoText.on('pointerdown', () => this.editMetadata());

    // Right-aligned action cluster.
    makeButton(this, GAME_WIDTH - 40,  TOPBAR_H / 2, 'BACK', '#888888', () => this.exitToMenu(), '11px')
      .setScrollFactor(0).setDepth(101);
    makeButton(this, GAME_WIDTH - 110, TOPBAR_H / 2, 'NEW',  '#ffaa44', () => this.confirmNew(), '11px')
      .setScrollFactor(0).setDepth(101);
    makeButton(this, GAME_WIDTH - 175, TOPBAR_H / 2, 'META', '#88ccff', () => this.editMetadata(), '11px')
      .setScrollFactor(0).setDepth(101);
    makeButton(this, GAME_WIDTH - 240, TOPBAR_H / 2, 'SAVE', '#00ff88', () => { void this.save(); }, '11px')
      .setScrollFactor(0).setDepth(101);

    // Undo/redo buttons give feedback on whether the stacks have content;
    // keyboard shortcuts still do the same.
    const undoBtn = makeButton(this, GAME_WIDTH - 310, TOPBAR_H / 2, 'UNDO', '#aaaaaa', () => this.undo(), '11px')
      .setScrollFactor(0).setDepth(101);
    const redoBtn = makeButton(this, GAME_WIDTH - 370, TOPBAR_H / 2, 'REDO', '#aaaaaa', () => this.redo(), '11px')
      .setScrollFactor(0).setDepth(101);
    // Refresh the label colour when the stacks change — done inside updateInfo.
    (this as unknown as { undoBtn: Phaser.GameObjects.Text }).undoBtn = undoBtn;
    (this as unknown as { redoBtn: Phaser.GameObjects.Text }).redoBtn = redoBtn;

    void rule;
  }

  // ═══ Sidebar (tool palette) ════════════════════════════════════════════════

  private buildSidebar(): void {
    this.add.rectangle(0, TOPBAR_H, SIDEBAR_W, GAME_HEIGHT - TOPBAR_H - STATUSBAR_H, 0x111625, 0.95)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(100);
    this.add.rectangle(SIDEBAR_W, TOPBAR_H, 1, GAME_HEIGHT - TOPBAR_H - STATUSBAR_H, 0x2a3150, 1)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(100);

    const tileX = SIDEBAR_W / 2;
    TOOL_ORDER.forEach((t, i) => {
      const y = TOPBAR_H + 12 + i * (TILE_SIZE_UI - 18);
      const bg = this.add.rectangle(tileX, y, TILE_SIZE_UI, TILE_SIZE_UI - TILE_PAD_UI, 0x1a2242, 1)
        .setStrokeStyle(2, 0x2a3150)
        .setScrollFactor(0).setDepth(101)
        .setInteractive({ useHandCursor: true });

      const swatch = this.add.rectangle(tileX, y - 10, 26, 12, TOOL_COLORS[t], 1)
        .setScrollFactor(0).setDepth(102);

      const label = this.add.text(tileX, y + 10, `${TOOL_KEYS[t]}·${TOOL_LABELS[t]}`, {
        ...FONT, fontSize: '7px', color: '#cccccc',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

      bg.on('pointerover', () => { if (this.tool !== t) bg.setFillStyle(0x252c52, 1); });
      bg.on('pointerout',  () => { if (this.tool !== t) bg.setFillStyle(0x1a2242, 1); });
      bg.on('pointerdown', () => this.selectTool(t));

      this.toolTiles.set(t, { bg, label, swatch });
    });
  }

  // ═══ Status bar ════════════════════════════════════════════════════════════

  private buildStatusBar(): void {
    this.add.rectangle(0, GAME_HEIGHT - STATUSBAR_H, GAME_WIDTH, STATUSBAR_H, 0x111625, 0.95)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(100);
    this.add.rectangle(0, GAME_HEIGHT - STATUSBAR_H, GAME_WIDTH, 1, 0x2a3150, 1)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(100);

    this.statusText = this.add.text(10, GAME_HEIGHT - STATUSBAR_H / 2, '', {
      ...FONT, fontSize: '9px', color: '#888888',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
  }

  // ═══ Inspector panel (right) ═══════════════════════════════════════════════

  private buildInspectorPanel(): void {
    const x = GAME_WIDTH - INSPECTOR_W;
    this.add.rectangle(x, TOPBAR_H, INSPECTOR_W, GAME_HEIGHT - TOPBAR_H - STATUSBAR_H, 0x111625, 0.95)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(100);
    this.add.rectangle(x, TOPBAR_H, 1, GAME_HEIGHT - TOPBAR_H - STATUSBAR_H, 0x2a3150, 1)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(100);

    this.inspectorTitle = this.add.text(x + INSPECTOR_W / 2, TOPBAR_H + 14, 'INSPECTOR', {
      ...FONT, fontSize: '11px', color: '#ffffff',
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(101);

    this.inspectorHint = this.add.text(x + INSPECTOR_W / 2, TOPBAR_H + 40,
      'Click an object\nwith SELECT\nto edit it.', {
      ...FONT, fontSize: '8px', color: '#777777', align: 'center',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101);
  }

  // ═══ Selection + inspector rendering ═══════════════════════════════════════

  private rebuildInspector(): void {
    // Tear down previous rows.
    for (const r of this.inspectorRows) r.destroy();
    this.inspectorRows = [];

    if (!this.selection) {
      this.inspectorTitle.setText('INSPECTOR');
      this.inspectorHint.setVisible(true);
      return;
    }
    this.inspectorHint.setVisible(false);

    const x0 = GAME_WIDTH - INSPECTOR_W;
    const cx = x0 + INSPECTOR_W / 2;
    let y = TOPBAR_H + 40;

    const addLabel = (text: string, color = '#ffffff'): void => {
      const t = this.add.text(x0 + 10, y, text, {
        ...FONT, fontSize: '9px', color,
      }).setOrigin(0, 0).setScrollFactor(0).setDepth(101);
      this.inspectorRows.push(t);
      y += 16;
    };

    const addRow = (label: string, value: string, onMinus: () => void, onPlus: () => void): void => {
      const lbl = this.add.text(x0 + 10, y + 6, label, {
        ...FONT, fontSize: '8px', color: '#cccccc',
      }).setOrigin(0, 0).setScrollFactor(0).setDepth(101);
      const val = this.add.text(cx + 8, y + 6, value, {
        ...FONT, fontSize: '9px', color: '#ffff99',
      }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101);

      const mk = (label: string, dx: number, fn: () => void): Phaser.GameObjects.Text => {
        const btn = this.add.text(x0 + INSPECTOR_W + dx, y + 4, label, {
          ...FONT, fontSize: '12px', color: '#88ddff',
          backgroundColor: '#223355', padding: { left: 6, right: 6, top: 2, bottom: 2 },
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(101)
          .setInteractive({ useHandCursor: true });
        btn.on('pointerover', () => btn.setColor('#ffffff'));
        btn.on('pointerout',  () => btn.setColor('#88ddff'));
        btn.on('pointerdown', fn);
        return btn;
      };
      const plus  = mk('+', -10, () => { this.pushUndo(); onPlus();  this.repaint(); this.rebuildInspector(); });
      const minus = mk('−', -38, () => { this.pushUndo(); onMinus(); this.repaint(); this.rebuildInspector(); });

      this.inspectorRows.push(lbl, val, plus, minus);
      y += 24;
    };

    const addToggleRow = (label: string, value: string, onClick: () => void): void => {
      const lbl = this.add.text(x0 + 10, y + 6, label, {
        ...FONT, fontSize: '8px', color: '#cccccc',
      }).setOrigin(0, 0).setScrollFactor(0).setDepth(101);
      const btn = this.add.text(x0 + INSPECTOR_W - 10, y + 4, value, {
        ...FONT, fontSize: '9px', color: '#ffff99',
        backgroundColor: '#223355', padding: { left: 6, right: 6, top: 2, bottom: 2 },
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(101)
        .setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => btn.setColor('#ffffff'));
      btn.on('pointerout',  () => btn.setColor('#ffff99'));
      btn.on('pointerdown', () => { this.pushUndo(); onClick(); this.repaint(); this.rebuildInspector(); });
      this.inspectorRows.push(lbl, btn);
      y += 24;
    };

    const sel = this.selection;
    if (sel.kind === 'rect') {
      const r = this.doc.solidRects[sel.index];
      if (!r) return;
      this.inspectorTitle.setText('TERRAIN');
      addLabel(r.tileType.toUpperCase(), '#88ccff');
      addToggleRow('type', r.tileType, () => {
        r.tileType = nextTileType(r.tileType);
      });
      addRow('x',     String(r.x),     () => { r.x = Math.max(0, r.x - GRID); }, () => { r.x += GRID; });
      addRow('y',     String(r.y),     () => { r.y = Math.max(0, r.y - GRID); }, () => { r.y += GRID; });
      addRow('width', String(r.width), () => { r.width  = Math.max(GRID, r.width  - GRID); }, () => { r.width  += GRID; });
      addRow('height',String(r.height),() => { r.height = Math.max(GRID, r.height - GRID); }, () => { r.height += GRID; });
    } else if (sel.kind === 'spawn') {
      const s = this.doc.spawnPoints[sel.index];
      if (!s) return;
      this.inspectorTitle.setText('SPAWN');
      addRow('x', String(s.x), () => { s.x = Math.max(0, s.x - GRID); }, () => { s.x += GRID; });
      addRow('y', String(s.y), () => { s.y = Math.max(0, s.y - GRID); }, () => { s.y += GRID; });
    } else if (sel.kind === 'object') {
      const o = this.doc.objects[sel.index];
      if (!o) return;
      this.inspectorTitle.setText(o.type.toUpperCase());
      addLabel(`id: ${o.id}`, '#888888');
      addRow('x', String(o.x), () => { o.x = Math.max(0, o.x - GRID); }, () => { o.x += GRID; });
      addRow('y', String(o.y), () => { o.y = Math.max(0, o.y - GRID); }, () => { o.y += GRID; });

      if (o.type === 'platform' || o.type === 'crumble' || o.type === 'button' || o.type === 'door' || o.type === 'trap' || o.type === 'spring') {
        addRow('width',  String(o.width),  () => { o.width  = Math.max(GRID, o.width  - GRID); }, () => { o.width  += GRID; });
        addRow('height', String(o.height), () => { o.height = Math.max(GRID, o.height - GRID); }, () => { o.height += GRID; });
      }

      if (o.type === 'firebar') {
        const seg = o.segments ?? 3;
        addRow('segments', String(seg),
          () => { o.segments = Math.max(1, seg - 1); },
          () => { o.segments = Math.min(8, seg + 1); });
        const spd = o.power ?? 2;
        addRow('speed', spd.toFixed(1),
          () => { o.power = +(spd - 0.5).toFixed(2); },
          () => { o.power = +(spd + 0.5).toFixed(2); });
        const ang = o.angleDeg ?? 0;
        addRow('start°', String(ang),
          () => { o.angleDeg = ang - 15; },
          () => { o.angleDeg = ang + 15; });
      }

      if (o.type === 'platform' && o.motion) {
        const m = o.motion;
        addToggleRow('axis', m.axis, () => { m.axis = m.axis === 'x' ? 'y' : 'x'; });
        addRow('from',  String(m.from),  () => { m.from -= GRID; }, () => { m.from += GRID; });
        addRow('to',    String(m.to),    () => { m.to   -= GRID; }, () => { m.to   += GRID; });
        addRow('speed', String(m.speed), () => { m.speed = Math.max(10, m.speed - 10); }, () => { m.speed += 10; });
      }

      if (o.type === 'button') {
        const reqP = o.requiredPlayers;
        addRow('required', String(reqP),
          () => { o.requiredPlayers = Math.max(1, reqP - 1); },
          () => { o.requiredPlayers = Math.min(8, reqP + 1); });
        addToggleRow('latching', o.latching ? 'yes' : 'no',
          () => { o.latching = !o.latching; });
      }

      if (o.type === 'spring') {
        const pw = o.power ?? -450;
        addRow('power', String(pw),
          () => { o.power = pw - 50; },
          () => { o.power = pw + 50; });
      }
    }

    // Actions at the bottom of the panel.
    y += 8;
    const dupe = this.add.text(x0 + 10, y + 4, '[D] DUPLICATE', {
      ...FONT, fontSize: '9px', color: '#aaffaa',
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(101)
      .setInteractive({ useHandCursor: true });
    dupe.on('pointerdown', () => this.duplicateSelected());
    this.inspectorRows.push(dupe);

    const del = this.add.text(x0 + 130, y + 4, '[Del] DELETE', {
      ...FONT, fontSize: '9px', color: '#ffaaaa',
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(101)
      .setInteractive({ useHandCursor: true });
    del.on('pointerdown', () => this.deleteSelected());
    this.inspectorRows.push(del);
  }

  // ═══ Pointer handlers ══════════════════════════════════════════════════════

  private onPointerDown(p: Phaser.Input.Pointer): void {
    if (!this.isInCanvas(p)) return;

    // Middle button OR space+left → pan.
    if (p.button === 1 || (this.spaceDown && p.button === 0)) {
      this.drag = {
        kind: 'pan',
        startScreenX: p.x,
        initialOffset: this.cameraOffsetX,
      };
      return;
    }
    if (p.button !== 0) return;

    const world = this.screenToWorld(p);

    if (this.tool === 'select') {
      // Resize handle hit-test first (if something already selected).
      const handle = this.hitHandle(world.x, world.y);
      if (handle && this.selection) {
        this.drag = {
          kind: 'resize',
          selRef: this.selection,
          handle,
          startWorld: world,
          initial: this.bboxOf(this.selection)!,
        };
        return;
      }

      // Click on body of an object → select & start move.
      const picked = this.pickAt(world.x, world.y);
      this.selection = picked;
      this.rebuildInspector();
      if (picked) {
        const center = this.centerOf(picked);
        if (center) {
          this.drag = { kind: 'move', selRef: picked, startWorld: world, initial: center };
        }
      }
      this.repaint();
      return;
    }

    if (this.tool === 'ground' || this.tool === 'platform' || this.tool === 'ice' ||
        this.tool === 'crumble' || this.tool === 'vplatform') {
      this.drag = { kind: 'paint', start: snap(world.x, world.y) };
      return;
    }
    if (this.tool === 'spawn') {
      this.pushUndo();
      const y = Math.min(snapY(world.y), FLOOR_Y - TILE_SIZE / 2);
      this.doc.spawnPoints.push({ x: snapX(world.x), y });
      this.selection = { kind: 'spawn', index: this.doc.spawnPoints.length - 1 };
      this.rebuildInspector();
      this.repaint();
    } else if (this.tool === 'goal') {
      this.pushUndo();
      this.doc.objects = this.doc.objects.filter(o => o.type !== 'goal');
      this.doc.objects.push({
        id: 'goal', type: 'goal',
        x: snapX(world.x), y: snapY(world.y),
        width: TILE_SIZE, height: TILE_SIZE,
        requiredPlayers: 0, linkedId: '',
      });
      this.selection = { kind: 'object', index: this.doc.objects.length - 1 };
      this.rebuildInspector();
      this.repaint();
    } else if (this.tool === 'firebar') {
      this.pushUndo();
      this.doc.objects.push({
        id: `fb${Date.now().toString(36)}`,
        type: 'firebar',
        x: snapX(world.x), y: snapY(world.y),
        width: TILE_SIZE, height: TILE_SIZE,
        requiredPlayers: 0, linkedId: '',
        segments: 3, angleDeg: 0, power: 2,
      });
      this.selection = { kind: 'object', index: this.doc.objects.length - 1 };
      this.rebuildInspector();
      this.repaint();
    } else if (this.tool === 'delete') {
      const hit = this.pickAt(world.x, world.y);
      if (hit) {
        this.pushUndo();
        this.removeSelection(hit);
        this.selection = null;
        this.rebuildInspector();
        this.repaint();
      }
    }
  }

  private onPointerMove(p: Phaser.Input.Pointer): void {
    if (!this.isInCanvas(p)) { this.hover = null; this.drawHover(); return; }
    const world = this.screenToWorld(p);

    // Active drag
    if (this.drag.kind === 'pan') {
      const dx = p.x - this.drag.startScreenX;
      this.cameraOffsetX = clampPan(this.drag.initialOffset - dx, this.doc.mapWidth);
      this.worldLayer.x = SIDEBAR_W - this.cameraOffsetX;
      this.updateInfo();
      return;
    }
    if (this.drag.kind === 'paint') {
      const rect = rectFromDrag(this.drag.start, { x: snapX(world.x), y: snapY(world.y) });
      this.previewGfx.clear();
      const colorHex = TOOL_COLORS[this.tool];
      this.previewGfx.fillStyle(colorHex, 0.45);
      this.previewGfx.fillRect(rect.x, rect.y, rect.width, rect.height);
      this.previewGfx.lineStyle(2, 0xffffff, 0.7);
      this.previewGfx.strokeRect(rect.x, rect.y, rect.width, rect.height);
      return;
    }
    if (this.drag.kind === 'move') {
      const dx = snapX(world.x - this.drag.startWorld.x + this.drag.initial.x) - this.drag.initial.x;
      const dy = snapY(world.y - this.drag.startWorld.y + this.drag.initial.y) - this.drag.initial.y;
      this.translateSelection(this.drag.selRef, this.drag.initial.x + dx, this.drag.initial.y + dy);
      this.repaint();
      return;
    }
    if (this.drag.kind === 'resize') {
      this.applyResize(this.drag, world);
      this.repaint();
      return;
    }

    // Hover (SELECT only)
    if (this.tool === 'select') {
      const newHover = this.pickAt(world.x, world.y);
      const changed = !sameSel(newHover, this.hover);
      this.hover = newHover;
      if (changed) this.drawHover();
    } else if (this.hover) {
      this.hover = null;
      this.drawHover();
    }
  }

  private onPointerUp(p: Phaser.Input.Pointer): void {
    if (this.drag.kind === 'paint') {
      const world = this.screenToWorld(p);
      const rect = rectFromDrag(this.drag.start, { x: snapX(world.x), y: snapY(world.y) });
      this.previewGfx.clear();
      this.drag = { kind: 'none' };
      if (rect.width < GRID || rect.height < GRID) return;
      this.commitPaint(rect);
      return;
    }
    if (this.drag.kind === 'move' || this.drag.kind === 'resize') {
      // Already mutated in-place during drag; push a single undo snapshot now.
      // Snapshot was taken at drag start via pushUndo on move/resize begin.
      this.drag = { kind: 'none' };
      this.repaint();
      return;
    }
    if (this.drag.kind === 'pan') {
      this.drag = { kind: 'none' };
      return;
    }
  }

  private onKeyDown(e: KeyboardEvent): void {
    // Tool hotkeys
    for (const t of TOOL_ORDER) {
      if (e.key === TOOL_KEYS[t]) { this.selectTool(t); return; }
    }
    if (e.code === 'Space') { this.spaceDown = true; return; }
    if (e.key === 'Escape') {
      if (this.selection) { this.selection = null; this.rebuildInspector(); this.repaint(); }
      else this.exitToMenu();
      return;
    }
    if (e.key === 'm' || e.key === 'M') { this.editMetadata(); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') { this.deleteSelected(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); this.undo(); return; }
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
      e.preventDefault(); this.redo(); return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') { e.preventDefault(); this.duplicateSelected(); return; }
    if (e.key === 'ArrowLeft')  { this.pan(-GRID * 4); return; }
    if (e.key === 'ArrowRight') { this.pan( GRID * 4); return; }
  }

  private onKeyUp(e: KeyboardEvent): void {
    if (e.code === 'Space') this.spaceDown = false;
  }

  // ═══ Paint commit (drag-end) ═══════════════════════════════════════════════

  private commitPaint(rect: { x: number; y: number; width: number; height: number }): void {
    this.pushUndo();
    if (this.tool === 'ground' || this.tool === 'platform' || this.tool === 'ice') {
      const tileType: TileType =
        this.tool === 'ground' ? 'ground' :
        this.tool === 'ice'    ? 'ice'    : 'platform';
      this.doc.solidRects.push({ ...rect, tileType });
      this.selection = { kind: 'rect', index: this.doc.solidRects.length - 1 };
    } else if (this.tool === 'crumble') {
      this.doc.objects.push({
        id: `cr${Date.now().toString(36)}`,
        type: 'crumble',
        x: rect.x + rect.width / 2,
        y: rect.y + TILE_SIZE / 2,
        width: rect.width,
        height: TILE_SIZE,
        requiredPlayers: 0,
        linkedId: '',
      });
      this.selection = { kind: 'object', index: this.doc.objects.length - 1 };
    } else if (this.tool === 'vplatform') {
      const centerY = rect.y + TILE_SIZE / 2;
      this.doc.objects.push({
        id: `mp${Date.now().toString(36)}`,
        type: 'platform',
        x: rect.x + rect.width / 2,
        y: centerY,
        width: rect.width,
        height: TILE_SIZE,
        requiredPlayers: 0,
        linkedId: '',
        motion: { axis: 'y', from: centerY, to: Math.max(0, centerY - 128), speed: 80 },
      });
      this.selection = { kind: 'object', index: this.doc.objects.length - 1 };
    }
    this.rebuildInspector();
    this.repaint();
  }

  // ═══ Selection helpers ═════════════════════════════════════════════════════

  /** Returns the axis-aligned bounding box (top-left coords) for a selection. */
  private bboxOf(sel: Selection): { x: number; y: number; width: number; height: number } | null {
    if (!sel) return null;
    if (sel.kind === 'rect') {
      const r = this.doc.solidRects[sel.index];
      return r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null;
    }
    if (sel.kind === 'spawn') {
      const s = this.doc.spawnPoints[sel.index];
      return s ? { x: s.x - TILE_SIZE / 2, y: s.y - TILE_SIZE / 2, width: TILE_SIZE, height: TILE_SIZE } : null;
    }
    const o = this.doc.objects[sel.index];
    return o ? { x: o.x - o.width / 2, y: o.y - o.height / 2, width: o.width, height: o.height } : null;
  }

  /** Returns the center coords (useful for move-drag). */
  private centerOf(sel: Selection): { x: number; y: number } | null {
    const b = this.bboxOf(sel);
    if (!b) return null;
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  }

  /** Find the object/spawn/rect under a world-space point. Prefers objects over rects. */
  private pickAt(x: number, y: number): Selection {
    // Objects (goal/firebar/crumble/platform/etc.)
    for (let i = this.doc.objects.length - 1; i >= 0; i--) {
      const o = this.doc.objects[i];
      if (x >= o.x - o.width / 2 && x <= o.x + o.width / 2 &&
          y >= o.y - o.height / 2 && y <= o.y + o.height / 2) {
        return { kind: 'object', index: i };
      }
    }
    // Spawn points — circular hit at TILE/2.
    for (let i = this.doc.spawnPoints.length - 1; i >= 0; i--) {
      const s = this.doc.spawnPoints[i];
      if (Math.abs(s.x - x) <= TILE_SIZE / 2 && Math.abs(s.y - y) <= TILE_SIZE / 2) {
        return { kind: 'spawn', index: i };
      }
    }
    // Solid rects (last since they're usually the biggest objects)
    for (let i = this.doc.solidRects.length - 1; i >= 0; i--) {
      const r = this.doc.solidRects[i];
      if (x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height) {
        return { kind: 'rect', index: i };
      }
    }
    return null;
  }

  /** World-space hit test against the 8 resize handles of the current selection. */
  private hitHandle(x: number, y: number): HandleKey | null {
    if (!this.selection) return null;
    const b = this.bboxOf(this.selection);
    if (!b) return null;
    // No resize on point-like selections (spawn, goal, firebar)
    if (this.selection.kind === 'object') {
      const o = this.doc.objects[this.selection.index];
      if (o.type === 'goal' || o.type === 'firebar') return null;
    }
    if (this.selection.kind === 'spawn') return null;

    const h = HANDLE_SIZE;
    const points: { key: HandleKey; cx: number; cy: number }[] = [
      { key: 'nw', cx: b.x,             cy: b.y              },
      { key: 'n',  cx: b.x + b.width/2, cy: b.y              },
      { key: 'ne', cx: b.x + b.width,   cy: b.y              },
      { key: 'e',  cx: b.x + b.width,   cy: b.y + b.height/2 },
      { key: 'se', cx: b.x + b.width,   cy: b.y + b.height   },
      { key: 's',  cx: b.x + b.width/2, cy: b.y + b.height   },
      { key: 'sw', cx: b.x,             cy: b.y + b.height   },
      { key: 'w',  cx: b.x,             cy: b.y + b.height/2 },
    ];
    for (const p of points) {
      if (Math.abs(p.cx - x) <= h && Math.abs(p.cy - y) <= h) return p.key;
    }
    return null;
  }

  /** Start-of-drag snapshot, then move selection center to new coords. */
  private translateSelection(sel: Selection, nx: number, ny: number): void {
    if (!sel) return;
    if (sel.kind === 'rect') {
      const r = this.doc.solidRects[sel.index];
      if (!r) return;
      r.x = snapX(nx - r.width / 2);
      r.y = snapY(ny - r.height / 2);
    } else if (sel.kind === 'spawn') {
      const s = this.doc.spawnPoints[sel.index];
      if (!s) return;
      s.x = snapX(nx);
      s.y = snapY(ny);
    } else {
      const o = this.doc.objects[sel.index];
      if (!o) return;
      const dx = snapX(nx) - o.x;
      const dy = snapY(ny) - o.y;
      o.x = snapX(nx);
      o.y = snapY(ny);
      // Keep vertical-platform motion range anchored to the new start centre.
      if (o.type === 'platform' && o.motion) {
        if (o.motion.axis === 'y') {
          o.motion.from += dy; o.motion.to += dy;
        } else {
          o.motion.from += dx; o.motion.to += dx;
        }
      }
    }
  }

  private applyResize(
    drag: Extract<DragMode, { kind: 'resize' }>,
    world: { x: number; y: number },
  ): void {
    const b = { ...drag.initial };
    const dxRaw = world.x - drag.startWorld.x;
    const dyRaw = world.y - drag.startWorld.y;
    const dx = Math.round(dxRaw / GRID) * GRID;
    const dy = Math.round(dyRaw / GRID) * GRID;

    let nx = b.x, ny = b.y, nw = b.width, nh = b.height;
    if (drag.handle === 'nw') { nx = b.x + dx; ny = b.y + dy; nw = b.width - dx; nh = b.height - dy; }
    if (drag.handle === 'n')  { ny = b.y + dy; nh = b.height - dy; }
    if (drag.handle === 'ne') { ny = b.y + dy; nw = b.width + dx; nh = b.height - dy; }
    if (drag.handle === 'e')  { nw = b.width + dx; }
    if (drag.handle === 'se') { nw = b.width + dx; nh = b.height + dy; }
    if (drag.handle === 's')  { nh = b.height + dy; }
    if (drag.handle === 'sw') { nx = b.x + dx; nw = b.width - dx; nh = b.height + dy; }
    if (drag.handle === 'w')  { nx = b.x + dx; nw = b.width - dx; }

    if (nw < GRID) { nw = GRID; if (drag.handle.includes('w')) nx = b.x + b.width - GRID; }
    if (nh < GRID) { nh = GRID; if (drag.handle.includes('n')) ny = b.y + b.height - GRID; }

    // Apply to underlying item.
    if (drag.selRef?.kind === 'rect') {
      const r = this.doc.solidRects[drag.selRef.index];
      if (!r) return;
      r.x = nx; r.y = ny; r.width = nw; r.height = nh;
    } else if (drag.selRef?.kind === 'object') {
      const o = this.doc.objects[drag.selRef.index];
      if (!o) return;
      o.x = nx + nw / 2; o.y = ny + nh / 2;
      o.width = nw; o.height = nh;
    }
  }

  private removeSelection(sel: Selection): void {
    if (!sel) return;
    if (sel.kind === 'rect')  this.doc.solidRects.splice(sel.index, 1);
    if (sel.kind === 'spawn') this.doc.spawnPoints.splice(sel.index, 1);
    if (sel.kind === 'object') this.doc.objects.splice(sel.index, 1);
  }

  private deleteSelected(): void {
    if (!this.selection) return;
    this.pushUndo();
    this.removeSelection(this.selection);
    this.selection = null;
    this.rebuildInspector();
    this.repaint();
  }

  private duplicateSelected(): void {
    if (!this.selection) return;
    this.pushUndo();
    const OFFSET = GRID * 2;
    const sel = this.selection;
    if (sel.kind === 'rect') {
      const r = this.doc.solidRects[sel.index];
      if (!r) return;
      this.doc.solidRects.push({ ...r, x: r.x + OFFSET, y: r.y + OFFSET });
      this.selection = { kind: 'rect', index: this.doc.solidRects.length - 1 };
    } else if (sel.kind === 'spawn') {
      const s = this.doc.spawnPoints[sel.index];
      if (!s) return;
      this.doc.spawnPoints.push({ x: s.x + OFFSET, y: s.y });
      this.selection = { kind: 'spawn', index: this.doc.spawnPoints.length - 1 };
    } else {
      const o = this.doc.objects[sel.index];
      if (!o) return;
      const copy: LevelObjectDef = {
        ...o,
        id: o.type === 'goal' ? 'goal_' + Date.now().toString(36) : o.type.slice(0,2) + Date.now().toString(36),
        x: o.x + OFFSET,
        y: o.y + OFFSET,
      };
      if (o.motion) copy.motion = { ...o.motion };
      this.doc.objects.push(copy);
      this.selection = { kind: 'object', index: this.doc.objects.length - 1 };
    }
    this.rebuildInspector();
    this.repaint();
  }

  // ═══ Undo/redo ═════════════════════════════════════════════════════════════

  private snapshot(): string {
    return JSON.stringify(this.doc);
  }

  private pushUndo(): void {
    this.undoStack.push(this.snapshot());
    if (this.undoStack.length > this.UNDO_LIMIT) this.undoStack.shift();
    this.redoStack = [];
  }

  private undo(): void {
    const snap = this.undoStack.pop();
    if (!snap) { this.setStatus('Nothing to undo.', '#aa6666'); return; }
    this.redoStack.push(this.snapshot());
    this.doc = JSON.parse(snap);
    this.selection = null;
    this.rebuildInspector();
    this.repaint();
    this.setStatus('Undone.');
  }

  private redo(): void {
    const snap = this.redoStack.pop();
    if (!snap) { this.setStatus('Nothing to redo.', '#aa6666'); return; }
    this.undoStack.push(this.snapshot());
    this.doc = JSON.parse(snap);
    this.selection = null;
    this.rebuildInspector();
    this.repaint();
    this.setStatus('Redone.');
  }

  // ═══ Tool selection ═════════════════════════════════════════════════════════

  private selectTool(t: Tool): void {
    this.tool = t;
    this.previewGfx.clear();
    this.drag = { kind: 'none' };

    // Only SELECT keeps the selection alive; the other tools drop selection
    // so their preview outline doesn't confuse the user.
    if (t !== 'select') { this.selection = null; this.rebuildInspector(); }

    this.toolTiles.forEach((tile, key) => {
      if (key === t) {
        tile.bg.setFillStyle(0x2a3e6a, 1);
        tile.bg.setStrokeStyle(2, 0xffffff);
        tile.label.setColor('#ffffff');
      } else {
        tile.bg.setFillStyle(0x1a2242, 1);
        tile.bg.setStrokeStyle(2, 0x2a3150);
        tile.label.setColor('#cccccc');
      }
    });

    this.setStatus(hintFor(t));
    this.repaint();
  }

  // ═══ Viewport / pan ═════════════════════════════════════════════════════════

  private pan(dx: number): void {
    this.cameraOffsetX = clampPan(this.cameraOffsetX + dx, this.doc.mapWidth);
    this.worldLayer.x = SIDEBAR_W - this.cameraOffsetX;
    this.updateInfo();
  }

  private screenToWorld(p: Phaser.Input.Pointer): { x: number; y: number } {
    return { x: p.x - SIDEBAR_W + this.cameraOffsetX, y: p.y - TOPBAR_H };
  }

  private isInCanvas(p: Phaser.Input.Pointer): boolean {
    return p.x >= SIDEBAR_W && p.x <= GAME_WIDTH - INSPECTOR_W
        && p.y >= TOPBAR_H  && p.y <= GAME_HEIGHT - STATUSBAR_H;
  }

  // ═══ Rendering ═════════════════════════════════════════════════════════════

  private repaint(): void {
    this.worldLayer.x = SIDEBAR_W - this.cameraOffsetX;
    this.worldLayer.y = TOPBAR_H;

    // Grid
    this.gridGfx.clear();
    this.gridGfx.fillStyle(0x0e1424, 1);
    this.gridGfx.fillRect(0, 0, this.doc.mapWidth, GAME_HEIGHT - TOPBAR_H - STATUSBAR_H);
    this.gridGfx.lineStyle(1, 0x2a3150, 0.5);
    for (let x = 0; x <= this.doc.mapWidth; x += GRID) {
      this.gridGfx.lineBetween(x, 0, x, GAME_HEIGHT - TOPBAR_H - STATUSBAR_H);
    }
    for (let y = 0; y <= GAME_HEIGHT - TOPBAR_H - STATUSBAR_H; y += GRID) {
      this.gridGfx.lineBetween(0, y, this.doc.mapWidth, y);
    }
    // Floor reference line
    this.gridGfx.lineStyle(2, 0x556688, 0.8);
    this.gridGfx.lineBetween(0, FLOOR_Y, this.doc.mapWidth, FLOOR_Y);

    // Content
    this.contentGfx.clear();
    for (const r of this.doc.solidRects) {
      const color =
        r.tileType === 'ground' ? 0x8b5a2b :
        r.tileType === 'ice'    ? 0x9fd9ff : 0x00aa66;
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
      this.drawObject(o);
    }

    this.drawHover();
    this.drawSelection();
    this.updateInfo();
  }

  private drawObject(o: LevelObjectDef): void {
    const tl = { x: o.x - o.width / 2, y: o.y - o.height / 2 };
    if (o.type === 'goal') {
      this.contentGfx.fillStyle(0xffff00, 1);
      this.contentGfx.fillRect(tl.x, tl.y, o.width, o.height);
      this.contentGfx.lineStyle(2, 0xffffff, 1);
      this.contentGfx.strokeRect(tl.x, tl.y, o.width, o.height);
    } else if (o.type === 'crumble') {
      this.contentGfx.fillStyle(0xa88060, 1);
      this.contentGfx.fillRect(tl.x, tl.y, o.width, o.height);
      this.contentGfx.lineStyle(1, 0x5a3a20, 1);
      this.contentGfx.strokeRect(tl.x, tl.y, o.width, o.height);
    } else if (o.type === 'platform' && o.motion) {
      this.contentGfx.fillStyle(0xc88c32, 1);
      this.contentGfx.fillRect(tl.x, tl.y, o.width, o.height);
      this.contentGfx.lineStyle(1, 0x6a4010, 1);
      this.contentGfx.strokeRect(tl.x, tl.y, o.width, o.height);
      // Motion range indicator
      this.contentGfx.lineStyle(2, 0xffaa66, 0.55);
      if (o.motion.axis === 'y') {
        this.contentGfx.lineBetween(o.x, o.motion.from, o.x, o.motion.to);
      } else {
        this.contentGfx.lineBetween(o.motion.from, o.y, o.motion.to, o.y);
      }
    } else if (o.type === 'firebar') {
      const segs = o.segments ?? 3;
      const length = segs * TILE_SIZE;
      this.contentGfx.fillStyle(0x332222, 1);
      this.contentGfx.fillCircle(o.x, o.y, 6);
      this.contentGfx.fillStyle(0xff4400, 0.9);
      for (let i = 0; i < segs; i++) {
        this.contentGfx.fillCircle(o.x + (i + 0.5) * TILE_SIZE, o.y, TILE_SIZE * 0.35);
      }
      this.contentGfx.lineStyle(1, 0xff6622, 0.25);
      this.contentGfx.strokeCircle(o.x, o.y, length);
    } else if (o.type === 'button' || o.type === 'door' || o.type === 'trap' || o.type === 'spring') {
      const color =
        o.type === 'button' ? 0xffff00 :
        o.type === 'door'   ? 0xcc3333 :
        o.type === 'trap'   ? 0xff5500 : 0x22cc88;
      this.contentGfx.fillStyle(color, 1);
      this.contentGfx.fillRect(tl.x, tl.y, o.width, o.height);
      this.contentGfx.lineStyle(1, 0xffffff, 0.3);
      this.contentGfx.strokeRect(tl.x, tl.y, o.width, o.height);
    }
  }

  private drawHover(): void {
    this.hoverGfx.clear();
    if (!this.hover) return;
    if (sameSel(this.hover, this.selection)) return;
    const b = this.bboxOf(this.hover);
    if (!b) return;
    this.hoverGfx.lineStyle(2, 0x88ddff, 0.7);
    this.hoverGfx.strokeRect(b.x - 1, b.y - 1, b.width + 2, b.height + 2);
  }

  private drawSelection(): void {
    this.selectionGfx.clear();
    if (!this.selection) return;
    const b = this.bboxOf(this.selection);
    if (!b) return;

    // Dashed-ish outline (Phaser lacks native dashed — mimic with offset pairs)
    this.selectionGfx.lineStyle(2, 0xffff66, 1);
    this.selectionGfx.strokeRect(b.x - 2, b.y - 2, b.width + 4, b.height + 4);

    // Handles — skip for goal/firebar/spawn (they have no meaningful dims)
    const noHandles = (
      (this.selection.kind === 'spawn') ||
      (this.selection.kind === 'object' && (
        this.doc.objects[this.selection.index]?.type === 'goal' ||
        this.doc.objects[this.selection.index]?.type === 'firebar'
      ))
    );
    if (noHandles) return;

    const h = HANDLE_SIZE;
    const pts = [
      [b.x,             b.y            ],
      [b.x + b.width/2, b.y            ],
      [b.x + b.width,   b.y            ],
      [b.x + b.width,   b.y + b.height/2],
      [b.x + b.width,   b.y + b.height ],
      [b.x + b.width/2, b.y + b.height ],
      [b.x,             b.y + b.height ],
      [b.x,             b.y + b.height/2],
    ];
    for (const [cx, cy] of pts) {
      this.selectionGfx.fillStyle(0xffff66, 1);
      this.selectionGfx.fillRect(cx - h / 2, cy - h / 2, h, h);
      this.selectionGfx.lineStyle(1, 0x000000, 1);
      this.selectionGfx.strokeRect(cx - h / 2, cy - h / 2, h, h);
    }
  }

  private updateInfo(): void {
    const g = this.doc.objects.filter(o => o.type === 'goal').length;
    this.infoText.setText(
      `"${this.doc.name || '(unnamed)'}"  min=${this.doc.minPlayers}  w=${this.doc.mapWidth}  ` +
      `rects=${this.doc.solidRects.length}  spawns=${this.doc.spawnPoints.length}  ` +
      `objs=${this.doc.objects.length}  goals=${g}  scroll=${this.cameraOffsetX}  [click to edit meta]`,
    );
    // Undo/redo enable feedback.
    const self = this as unknown as { undoBtn?: Phaser.GameObjects.Text; redoBtn?: Phaser.GameObjects.Text };
    self.undoBtn?.setColor(this.undoStack.length ? '#ffffff' : '#555555');
    self.redoBtn?.setColor(this.redoStack.length ? '#ffffff' : '#555555');
  }

  private setStatus(msg: string, color = '#888888'): void {
    this.statusText.setText(msg).setColor(color);
  }

  // ═══ Document lifecycle ════════════════════════════════════════════════════

  private async save(): Promise<void> {
    if (!this.doc.name.trim())              { this.editMetadata(); this.setStatus('Name the level first, then SAVE.', '#ff6666'); return; }
    if (this.doc.objects.filter(o => o.type === 'goal').length === 0) { this.setStatus('Add a GOAL before saving.', '#ff6666'); return; }
    if (this.doc.spawnPoints.length === 0)  { this.setStatus('Add at least one SPAWN before saving.', '#ff6666'); return; }

    const acct = loadStoredAccount();
    if (!acct || !acct.password || acct.role !== 'admin') {
      this.setStatus('Not authorised — log in again as admin.', '#ff6666');
      return;
    }

    const level: LevelData = {
      id: this.doc.id || Date.now() % 1_000_000,
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
        body: JSON.stringify({ username: acct.username, password: acct.password, level }),
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
    this.pushUndo();
    this.doc = blankDoc();
    this.cameraOffsetX = 0;
    this.selection = null;
    this.rebuildInspector();
    this.repaint();
    this.setStatus('New level. Drag with a paint tool to create terrain.');
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

    this.pushUndo();
    const minP = Math.max(1, Math.min(8, Math.floor(Number(minStr) || 1)));
    const w = Math.max(GAME_WIDTH, Math.round((Number(widthStr) || GAME_WIDTH) / GRID) * GRID);
    this.doc.name = name.trim().slice(0, 40);
    this.doc.minPlayers = minP;
    this.doc.mapWidth = w;
    this.repaint();
  }
}

// ═══ Helpers ════════════════════════════════════════════════════════════════

function blankDoc(): EditorDoc {
  return {
    id: 0,
    name: '',
    minPlayers: 1,
    mapWidth: GAME_WIDTH,
    solidRects: [
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

function clampPan(offset: number, mapWidth: number): number {
  const canvasVisibleW = GAME_WIDTH - SIDEBAR_W - INSPECTOR_W;
  const max = Math.max(0, mapWidth - canvasVisibleW);
  return Phaser.Math.Clamp(offset, 0, max);
}

function sameSel(a: Selection, b: Selection): boolean {
  if (a === null || b === null) return a === b;
  return a.kind === b.kind && a.index === b.index;
}

function nextTileType(t: TileType): TileType {
  return t === 'ground' ? 'platform' : t === 'platform' ? 'ice' : 'ground';
}

function hintFor(t: Tool): string {
  switch (t) {
    case 'select':    return 'Select: click to pick, drag to move, corners to resize. Del / Ctrl+D.';
    case 'ground':    return 'Ground: drag to paint a solid block (blocks + lands-on).';
    case 'platform':  return 'Platform: drag to paint a one-way platform.';
    case 'ice':       return 'Ice: drag to paint a slippery surface.';
    case 'spawn':     return 'Spawn: click to place a spawn point.';
    case 'goal':      return 'Goal: click to place the goal (level has one).';
    case 'firebar':   return 'Fire bar: click to drop; edit segments/speed in the inspector.';
    case 'crumble':   return 'Crumble: drag to paint a platform that falls when stepped on.';
    case 'vplatform': return 'V-Platform: drag to paint; edit travel/speed in the inspector.';
    case 'delete':    return 'Delete: click an object to remove it.';
  }
}
