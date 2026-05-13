import Phaser from 'phaser';
import { FONT, makeButton } from '../ui/theme';
import { HTTP_URL } from '../network/endpoints';
import { loadStoredAccount } from './AuthScene';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  TILE_SIZE,
  MAX_PLAYERS,
  type LevelData,
  type LevelObjectDef,
  type LevelPack,
  type SolidRect,
  type SpawnPoint,
  type TileType,
} from '@pikopark/shared';

const TOP_H = 58;
const LEFT_W = 196;
const RIGHT_W = 278;
const STATUS_H = 28;
const VIEW_W = GAME_WIDTH - LEFT_W - RIGHT_W;
const VIEW_H = GAME_HEIGHT - TOP_H - STATUS_H;
const GRID = TILE_SIZE;
const SNAP = TILE_SIZE / 4;
const FLOOR_TOP = GAME_HEIGHT - TILE_SIZE;
const PLAYER_ON_FLOOR = FLOOR_TOP - TILE_SIZE / 2;
const MIN_MAP_W = GAME_WIDTH;
const MAX_MAP_W = 4800;

type PaletteKind =
  | 'ground' | 'platform' | 'ice'
  | 'spawn' | 'goal' | 'button' | 'door'
  | 'trap' | 'spike' | 'spring' | 'movingPlatform'
  | 'crumble' | 'firebar' | 'box' | 'lavawall' | 'vine';

type Selection =
  | { kind: 'rect'; index: number }
  | { kind: 'spawn'; index: number }
  | { kind: 'object'; index: number }
  | null;

type DragState =
  | { kind: 'none' }
  | { kind: 'palette'; item: PaletteKind }
  | { kind: 'move'; selection: Selection; offsetX: number; offsetY: number }
  | { kind: 'pan'; startX: number; startOffset: number };

interface PaletteItem {
  kind: PaletteKind;
  label: string;
  group: string;
  color: number;
}

interface PackDoc {
  id: string;
  name: string;
  minPlayers: 1 | 2 | 4;
  levels: LevelData[];
}

const PALETTE: PaletteItem[] = [
  { kind: 'ground', label: 'Ground', group: 'Terrain', color: 0x7c4f1e },
  { kind: 'platform', label: 'Platform', group: 'Terrain', color: 0x8f94b8 },
  { kind: 'ice', label: 'Ice', group: 'Terrain', color: 0x9fd9ff },
  { kind: 'spawn', label: 'Spawn', group: 'Basics', color: 0xffffff },
  { kind: 'goal', label: 'Goal', group: 'Basics', color: 0x4488cc },
  { kind: 'button', label: 'Button', group: 'Logic', color: 0xff9900 },
  { kind: 'door', label: 'Door', group: 'Logic', color: 0xcc3333 },
  { kind: 'box', label: 'Box', group: 'Logic', color: 0xb87333 },
  { kind: 'trap', label: 'Lava', group: 'Hazards', color: 0xff5500 },
  { kind: 'spike', label: 'Spikes', group: 'Hazards', color: 0xd8d8e8 },
  { kind: 'firebar', label: 'Firebar', group: 'Hazards', color: 0xff4400 },
  { kind: 'lavawall', label: 'Lava Wall', group: 'Hazards', color: 0xff3300 },
  { kind: 'spring', label: 'Spring', group: 'Movement', color: 0x22cc88 },
  { kind: 'movingPlatform', label: 'Mover', group: 'Movement', color: 0xc88c32 },
  { kind: 'crumble', label: 'Crumble', group: 'Movement', color: 0xa88060 },
  { kind: 'vine', label: 'Vine', group: 'Movement', color: 0x5bc06b },
];

export class EditorScene extends Phaser.Scene {
  private pack!: PackDoc;
  private levelIndex = 0;
  private selection: Selection = null;
  private drag: DragState = { kind: 'none' };
  private cameraOffsetX = 0;
  private setupActive = false;
  private spaceDown = false;

  private worldLayer!: Phaser.GameObjects.Container;
  private gridGfx!: Phaser.GameObjects.Graphics;
  private levelGfx!: Phaser.GameObjects.Graphics;
  private previewGfx!: Phaser.GameObjects.Graphics;
  private uiGroup!: Phaser.GameObjects.Group;
  private inspectorGroup!: Phaser.GameObjects.Group;
  private setupGroup!: Phaser.GameObjects.Group;
  private statusText!: Phaser.GameObjects.Text;
  private packTitle!: Phaser.GameObjects.Text;
  private levelTabs: Phaser.GameObjects.Text[] = [];
  private issuesText!: Phaser.GameObjects.Text;

  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private readonly UNDO_LIMIT = 40;

  constructor() {
    super({ key: 'EditorScene' });
  }

  create(): void {
    const acct = loadStoredAccount();
    if (acct?.role !== 'admin') {
      this.scene.start('MenuScene');
      return;
    }

    this.pack = blankPack();
    this.levelIndex = 0;
    this.selection = null;
    this.drag = { kind: 'none' };
    this.cameraOffsetX = 0;
    this.undoStack = [];
    this.redoStack = [];
    this.levelTabs = [];

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0c111c).setOrigin(0);
    this.worldLayer = this.add.container(LEFT_W, TOP_H);
    this.gridGfx = this.add.graphics();
    this.levelGfx = this.add.graphics();
    this.previewGfx = this.add.graphics();
    this.worldLayer.add([this.gridGfx, this.levelGfx, this.previewGfx]);

    this.uiGroup = this.add.group();
    this.inspectorGroup = this.add.group();
    this.setupGroup = this.add.group();

    this.buildChrome();
    this.buildPalette();
    this.rebuildLevelTabs();
    this.rebuildInspector();
    this.repaint();

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.onPointerDown(p));
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.onPointerMove(p));
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => this.onPointerUp(p));
    this.input.on('wheel', (_p: Phaser.Input.Pointer, _go: unknown, dx: number, dy: number) => {
      if (this.setupActive) return;
      this.pan(dx + dy);
    });
    this.input.keyboard!.on('keydown', this.onKeyDown, this);
    this.input.keyboard!.on('keyup', this.onKeyUp, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard!.off('keydown', this.onKeyDown, this);
      this.input.keyboard!.off('keyup', this.onKeyUp, this);
    });

    this.showSetup();
  }

  private get level(): LevelData {
    return this.pack.levels[this.levelIndex]!;
  }

  private buildChrome(): void {
    this.add.rectangle(0, 0, GAME_WIDTH, TOP_H, 0x111827, 0.98).setOrigin(0).setDepth(50);
    this.add.rectangle(0, TOP_H, LEFT_W, VIEW_H, 0x101522, 0.98).setOrigin(0).setDepth(50);
    this.add.rectangle(GAME_WIDTH - RIGHT_W, TOP_H, RIGHT_W, VIEW_H, 0x101522, 0.98).setOrigin(0).setDepth(50);
    this.add.rectangle(0, GAME_HEIGHT - STATUS_H, GAME_WIDTH, STATUS_H, 0x111827, 0.98).setOrigin(0).setDepth(50);
    this.add.rectangle(LEFT_W, TOP_H, 1, VIEW_H, 0x2a3448).setOrigin(0).setDepth(51);
    this.add.rectangle(GAME_WIDTH - RIGHT_W, TOP_H, 1, VIEW_H, 0x2a3448).setOrigin(0).setDepth(51);

    this.packTitle = this.add.text(14, 13, '', {
      ...FONT, fontSize: '13px', color: '#ffffff',
    }).setDepth(60).setInteractive({ useHandCursor: true });
    this.packTitle.on('pointerdown', () => this.editPackMeta());

    makeButton(this, GAME_WIDTH - 40, 28, 'BACK', '#aaaaaa', () => this.scene.start('MenuScene'), '10px').setDepth(60);
    makeButton(this, GAME_WIDTH - 114, 28, 'LOAD', '#ffcc66', () => { void this.loadPacks(); }, '10px').setDepth(60);
    makeButton(this, GAME_WIDTH - 190, 28, 'SAVE', '#00ff88', () => { void this.savePack(); }, '10px').setDepth(60);
    makeButton(this, GAME_WIDTH - 268, 28, 'NEW', '#88ccff', () => this.confirmNewPack(), '10px').setDepth(60);
    makeButton(this, GAME_WIDTH - 352, 28, 'REDO', '#aaaaaa', () => this.redo(), '10px').setDepth(60);
    makeButton(this, GAME_WIDTH - 428, 28, 'UNDO', '#aaaaaa', () => this.undo(), '10px').setDepth(60);

    this.statusText = this.add.text(12, GAME_HEIGHT - STATUS_H / 2, '', {
      ...FONT, fontSize: '9px', color: '#94a3b8',
    }).setOrigin(0, 0.5).setDepth(60);
  }

  private buildPalette(): void {
    const title = this.add.text(16, TOP_H + 14, 'DRAG TO MAP', {
      ...FONT, fontSize: '10px', color: '#9cc9ff',
    }).setDepth(60);
    this.uiGroup.add(title);

    let y = TOP_H + 40;
    let currentGroup = '';
    for (const item of PALETTE) {
      if (item.group !== currentGroup) {
        currentGroup = item.group;
        const groupText = this.add.text(16, y, currentGroup.toUpperCase(), {
          ...FONT, fontSize: '8px', color: '#64748b',
        }).setDepth(60);
        this.uiGroup.add(groupText);
        y += 16;
      }

      const row = this.add.rectangle(16, y, LEFT_W - 32, 28, 0x1a2335, 1)
        .setOrigin(0).setDepth(60).setStrokeStyle(1, 0x334155)
        .setInteractive({ useHandCursor: true });
      const chip = this.add.rectangle(30, y + 14, 16, 16, item.color, 1)
        .setDepth(61).setStrokeStyle(1, 0xffffff, 0.3);
      const text = this.add.text(48, y + 14, item.label, {
        ...FONT, fontSize: '9px', color: '#dbeafe',
      }).setOrigin(0, 0.5).setDepth(61);

      row.on('pointerover', () => row.setFillStyle(0x24324b));
      row.on('pointerout', () => row.setFillStyle(0x1a2335));
      row.on('pointerdown', () => {
        if (this.setupActive) return;
        this.drag = { kind: 'palette', item: item.kind };
        this.setStatus(`Drag ${item.label} onto the map.`);
      });
      this.uiGroup.addMultiple([row, chip, text]);
      y += 32;
    }
  }

  private rebuildLevelTabs(): void {
    for (const tab of this.levelTabs) tab.destroy();
    this.levelTabs = [];

    const startX = 245;
    this.pack.levels.forEach((level, i) => {
      const selected = i === this.levelIndex;
      const tab = this.add.text(startX + i * 104, 28, `L${i + 1} ${level.name || 'Untitled'}`, {
        ...FONT,
        fontSize: '8px',
        color: selected ? '#00ff88' : '#9ca3af',
        backgroundColor: selected ? '#12351f' : '#1f2937',
        padding: { left: 8, right: 8, top: 5, bottom: 5 },
      }).setOrigin(0, 0.5).setDepth(60).setInteractive({ useHandCursor: true });
      tab.on('pointerdown', () => {
        if (this.levelIndex === i) return;
        this.levelIndex = i;
        this.selection = null;
        this.cameraOffsetX = 0;
        this.rebuildLevelTabs();
        this.rebuildInspector();
        this.repaint();
      });
      this.levelTabs.push(tab);
    });
    this.updateInfo();
  }

  private rebuildInspector(): void {
    this.inspectorGroup.clear(true, true);
    const x = GAME_WIDTH - RIGHT_W + 18;
    let y = TOP_H + 18;

    const add = (obj: Phaser.GameObjects.GameObject): void => {
      obj.setDepth(60);
      this.inspectorGroup.add(obj);
    };
    const label = (text: string, color = '#ffffff', size = '10px'): void => {
      add(this.add.text(x, y, text, { ...FONT, fontSize: size, color }));
      y += 18;
    };
    const button = (text: string, color: string, cb: () => void): void => {
      const b = this.add.text(x, y, text, {
        ...FONT, fontSize: '9px', color,
        backgroundColor: '#1f2937',
        padding: { left: 8, right: 8, top: 5, bottom: 5 },
      }).setInteractive({ useHandCursor: true });
      b.on('pointerover', () => b.setColor('#ffffff'));
      b.on('pointerout', () => b.setColor(color));
      b.on('pointerdown', cb);
      add(b);
      y += 32;
    };
    const row = (name: string, value: string, minus: () => void, plus: () => void): void => {
      add(this.add.text(x, y + 6, `${name}: ${value}`, { ...FONT, fontSize: '8px', color: '#cbd5e1' }));
      const m = this.add.text(x + 170, y, '-', buttonStyle('#ffcc66')).setInteractive({ useHandCursor: true });
      const p = this.add.text(x + 205, y, '+', buttonStyle('#88ddff')).setInteractive({ useHandCursor: true });
      m.on('pointerdown', () => { this.pushUndo(); minus(); this.afterEdit(); });
      p.on('pointerdown', () => { this.pushUndo(); plus(); this.afterEdit(); });
      add(m); add(p);
      y += 28;
    };

    label('LEVEL', '#9cc9ff', '11px');
    label(this.level.name || `Level ${this.levelIndex + 1}`, '#ffffff', '12px');
    label(`${this.level.mapWidth ?? GAME_WIDTH}px wide | ${this.pack.minPlayers}+ players`, '#94a3b8', '8px');
    button('EDIT LEVEL SETUP', '#88ccff', () => this.editLevelMeta());
    button('CENTER ON GOAL', '#ffcc66', () => this.centerOnGoal());

    this.issuesText = this.add.text(x, y, '', {
      ...FONT, fontSize: '8px', color: '#ffcc66',
      wordWrap: { width: RIGHT_W - 36 },
    }).setDepth(60);
    add(this.issuesText);
    y += 76;

    if (!this.selection) {
      label('SELECTION', '#9cc9ff', '11px');
      label('Click anything on the map to edit it.', '#64748b', '8px');
      this.refreshIssues();
      return;
    }

    const bounds = this.boundsForSelection(this.selection);
    if (!bounds) {
      this.selection = null;
      this.rebuildInspector();
      return;
    }

    label('SELECTION', '#9cc9ff', '11px');

    if (this.selection.kind === 'rect') {
      const r = this.level.solidRects[this.selection.index]!;
      label(r.tileType.toUpperCase(), '#ffffff', '12px');
      button(`TYPE: ${r.tileType}`, '#88ccff', () => {
        this.pushUndo();
        r.tileType = nextTile(r.tileType);
        this.afterEdit();
      });
      row('x', String(r.x), () => { r.x = Math.max(0, r.x - SNAP); }, () => { r.x = Math.min(this.mapWidth() - r.width, r.x + SNAP); });
      row('y', String(r.y), () => { r.y = Math.max(0, r.y - SNAP); }, () => { r.y = Math.min(FLOOR_TOP, r.y + SNAP); });
      row('w', String(r.width), () => { r.width = Math.max(GRID, r.width - GRID); }, () => { r.width = Math.min(this.mapWidth() - r.x, r.width + GRID); });
      row('h', String(r.height), () => { r.height = Math.max(GRID, r.height - GRID); }, () => { r.height = Math.min(GAME_HEIGHT - r.y, r.height + GRID); });
      button('DELETE', '#ff7777', () => this.deleteSelection());
    } else if (this.selection.kind === 'spawn') {
      const s = this.level.spawnPoints[this.selection.index]!;
      label(`SPAWN ${this.selection.index + 1}`, '#ffffff', '12px');
      row('x', String(s.x), () => { s.x = clamp(s.x - SNAP, TILE_SIZE / 2, this.mapWidth() - TILE_SIZE / 2); }, () => { s.x = clamp(s.x + SNAP, TILE_SIZE / 2, this.mapWidth() - TILE_SIZE / 2); });
      row('y', String(s.y), () => { s.y = clamp(s.y - SNAP, TILE_SIZE / 2, GAME_HEIGHT - TILE_SIZE / 2); }, () => { s.y = clamp(s.y + SNAP, TILE_SIZE / 2, GAME_HEIGHT - TILE_SIZE / 2); });
      if (this.level.spawnPoints.length > this.pack.minPlayers) button('DELETE', '#ff7777', () => this.deleteSelection());
    } else {
      const o = this.level.objects[this.selection.index]!;
      label(o.type.toUpperCase(), '#ffffff', '12px');
      row('x', String(Math.round(o.x)), () => { o.x = clamp(o.x - SNAP, o.width / 2, this.mapWidth() - o.width / 2); }, () => { o.x = clamp(o.x + SNAP, o.width / 2, this.mapWidth() - o.width / 2); });
      row('y', String(Math.round(o.y)), () => { o.y = clamp(o.y - SNAP, o.height / 2, GAME_HEIGHT - o.height / 2); }, () => { o.y = clamp(o.y + SNAP, o.height / 2, GAME_HEIGHT - o.height / 2); });
      row('w', String(Math.round(o.width)), () => { o.width = Math.max(8, o.width - SNAP); }, () => { o.width += SNAP; });
      row('h', String(Math.round(o.height)), () => { o.height = Math.max(8, o.height - SNAP); }, () => { o.height += SNAP; });
      if (o.type === 'button') {
        button(`MODE: ${o.latching ? 'LATCH' : 'HOLD'}`, '#88ccff', () => {
          this.pushUndo();
          o.latching = !o.latching;
          this.afterEdit();
        });
        button(`LINK: ${o.linkedId || 'none'}`, '#ffcc66', () => {
          this.pushUndo();
          o.linkedId = nextDoorId(this.level, o.linkedId);
          this.afterEdit();
        });
      }
      if (o.type === 'platform' && o.motion) {
        button(`AXIS: ${o.motion.axis.toUpperCase()}`, '#88ccff', () => {
          this.pushUndo();
          o.motion!.axis = o.motion!.axis === 'x' ? 'y' : 'x';
          syncMotionToObject(o);
          this.afterEdit();
        });
        row('range', String(Math.abs(o.motion.to - o.motion.from)), () => changeMotionRange(o, -SNAP), () => changeMotionRange(o, SNAP));
        row('speed', String(o.motion.speed), () => { o.motion!.speed = Math.max(20, o.motion!.speed - 20); }, () => { o.motion!.speed += 20; });
      }
      if (o.type === 'firebar') {
        row('segments', String(o.segments ?? 3), () => { o.segments = Math.max(1, (o.segments ?? 3) - 1); }, () => { o.segments = Math.min(8, (o.segments ?? 3) + 1); });
        row('speed', String(o.power ?? 2), () => { o.power = Math.max(0.5, (o.power ?? 2) - 0.5); }, () => { o.power = Math.min(8, (o.power ?? 2) + 0.5); });
      }
      if (o.type === 'lavawall' || o.type === 'vine') {
        row('speed', String(o.speed ?? 100), () => { o.speed = (o.speed ?? 100) - 40; }, () => { o.speed = (o.speed ?? 100) + 40; });
      }
      if (o.type !== 'goal') button('DELETE', '#ff7777', () => this.deleteSelection());
      else label('The goal cannot be deleted. Drag it somewhere reachable.', '#94a3b8', '8px');
    }

    void bounds;
    this.refreshIssues();
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.setupActive) return;
    if (pointer.x < LEFT_W || pointer.x > GAME_WIDTH - RIGHT_W || pointer.y < TOP_H || pointer.y > GAME_HEIGHT - STATUS_H) {
      return;
    }
    if (pointer.middleButtonDown() || this.spaceDown) {
      this.drag = { kind: 'pan', startX: pointer.x, startOffset: this.cameraOffsetX };
      return;
    }

    const world = this.screenToWorld(pointer.x, pointer.y);
    const hit = this.hitTest(world.x, world.y);
    if (hit) {
      this.selection = hit;
      const b = this.boundsForSelection(hit)!;
      this.pushUndo();
      this.drag = { kind: 'move', selection: hit, offsetX: world.x - b.x, offsetY: world.y - b.y };
      this.rebuildInspector();
      this.repaint();
    } else {
      this.selection = null;
      this.rebuildInspector();
      this.repaint();
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (this.setupActive) return;
    if (this.drag.kind === 'pan') {
      this.cameraOffsetX = clampPan(this.drag.startOffset - (pointer.x - this.drag.startX), this.mapWidth());
      this.repaint();
      return;
    }
    if (this.drag.kind === 'move' && this.drag.selection) {
      const world = this.screenToWorld(pointer.x, pointer.y);
      this.moveSelection(this.drag.selection, world.x - this.drag.offsetX, world.y - this.drag.offsetY);
      this.repaint();
      return;
    }
    if (this.drag.kind === 'palette') {
      this.repaint();
      this.drawPalettePreview(pointer);
    }
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.setupActive) return;
    if (this.drag.kind === 'palette') {
      const world = this.screenToWorld(pointer.x, pointer.y);
      if (this.isInWorld(pointer.x, pointer.y)) {
        this.pushUndo();
        this.placePaletteItem(this.drag.item, world.x, world.y);
        this.afterEdit();
      }
    } else if (this.drag.kind === 'move') {
      this.pushUndoSnapshotIfChanged();
      this.rebuildInspector();
    }
    this.drag = { kind: 'none' };
    this.previewGfx.clear();
    this.refreshIssues();
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key === ' ') this.spaceDown = true;
    if (this.setupActive) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      if (event.shiftKey) this.redo();
      else this.undo();
      event.preventDefault();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
      this.redo();
      event.preventDefault();
      return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      this.deleteSelection();
      event.preventDefault();
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    if (event.key === ' ') this.spaceDown = false;
  }

  private placePaletteItem(kind: PaletteKind, rawX: number, rawY: number): void {
    const x = clamp(snapX(rawX), 0, this.mapWidth());
    const y = clamp(snapY(rawY), 0, GAME_HEIGHT);
    const id = makeId(this.level, kind);

    if (kind === 'ground' || kind === 'platform' || kind === 'ice') {
      const tileType: TileType = kind === 'ice' ? 'ice' : kind;
      const rect: SolidRect = {
        x: clamp(x, 0, this.mapWidth() - GRID * 4),
        y: clamp(y, 0, FLOOR_TOP),
        width: kind === 'ground' ? GRID * 6 : GRID * 4,
        height: GRID,
        tileType,
      };
      this.level.solidRects.push(rect);
      this.selection = { kind: 'rect', index: this.level.solidRects.length - 1 };
      return;
    }

    if (kind === 'spawn') {
      const spawn = { x: clamp(x, TILE_SIZE / 2, this.mapWidth() - TILE_SIZE / 2), y: clamp(y, TILE_SIZE / 2, GAME_HEIGHT - TILE_SIZE / 2) };
      this.level.spawnPoints.push(spawn);
      this.selection = { kind: 'spawn', index: this.level.spawnPoints.length - 1 };
      return;
    }

    if (kind === 'goal') {
      const goal = ensureGoal(this.level);
      goal.x = clamp(x, goal.width / 2, this.mapWidth() - goal.width / 2);
      goal.y = clamp(y, goal.height / 2, GAME_HEIGHT - goal.height / 2);
      this.selection = { kind: 'object', index: this.level.objects.indexOf(goal) };
      return;
    }

    const object = objectFor(kind, id, x, y, this.level);
    this.level.objects.push(object);
    if (object.type === 'door') linkFirstUnlinkedButton(this.level, object.id);
    if (object.type === 'button' && !object.linkedId) object.linkedId = firstDoorId(this.level);
    this.selection = { kind: 'object', index: this.level.objects.length - 1 };
  }

  private moveSelection(selection: Selection, rawX: number, rawY: number): void {
    if (!selection) return;
    if (selection.kind === 'rect') {
      const r = this.level.solidRects[selection.index];
      if (!r) return;
      r.x = clamp(snapX(rawX), 0, this.mapWidth() - r.width);
      r.y = clamp(snapY(rawY), 0, GAME_HEIGHT - r.height);
    } else if (selection.kind === 'spawn') {
      const s = this.level.spawnPoints[selection.index];
      if (!s) return;
      s.x = clamp(snapX(rawX), TILE_SIZE / 2, this.mapWidth() - TILE_SIZE / 2);
      s.y = clamp(snapY(rawY), TILE_SIZE / 2, GAME_HEIGHT - TILE_SIZE / 2);
    } else {
      const o = this.level.objects[selection.index];
      if (!o) return;
      o.x = clamp(snapX(rawX), o.width / 2, this.mapWidth() - o.width / 2);
      o.y = clamp(snapY(rawY), o.height / 2, GAME_HEIGHT - o.height / 2);
      if (o.type === 'platform' && o.motion) syncMotionToObject(o);
    }
  }

  private deleteSelection(): void {
    if (!this.selection) return;
    this.pushUndo();
    if (this.selection.kind === 'rect') {
      if (this.level.solidRects.length <= 1) {
        this.setStatus('Keep at least one floor or platform.', '#ffcc66');
        return;
      }
      this.level.solidRects.splice(this.selection.index, 1);
    } else if (this.selection.kind === 'spawn') {
      if (this.level.spawnPoints.length <= this.pack.minPlayers) {
        this.setStatus(`Need at least ${this.pack.minPlayers} spawn points.`, '#ffcc66');
        return;
      }
      this.level.spawnPoints.splice(this.selection.index, 1);
    } else {
      const obj = this.level.objects[this.selection.index];
      if (obj?.type === 'goal') {
        this.setStatus('Every level needs one goal, so it stays.', '#ffcc66');
        return;
      }
      const deletedId = obj?.id ?? '';
      this.level.objects.splice(this.selection.index, 1);
      for (const o of this.level.objects) if (o.linkedId === deletedId) o.linkedId = '';
    }
    this.selection = null;
    this.afterEdit();
  }

  private repaint(): void {
    this.worldLayer.x = LEFT_W - this.cameraOffsetX;
    this.gridGfx.clear();
    this.levelGfx.clear();

    const level = this.level;
    const mapWidth = this.mapWidth();
    this.drawGrid(mapWidth);

    this.levelGfx.fillStyle(0x67aee0, 1);
    this.levelGfx.fillRect(0, 0, mapWidth, VIEW_H);
    this.levelGfx.fillStyle(0xffffff, 0.2);
    for (let x = 140; x < mapWidth; x += 420) {
      this.levelGfx.fillCircle(x, 90, 28);
      this.levelGfx.fillCircle(x + 34, 84, 34);
      this.levelGfx.fillCircle(x + 74, 94, 24);
    }

    for (const rect of level.solidRects) this.drawSolid(rect);
    for (let i = 0; i < level.spawnPoints.length; i++) this.drawSpawn(level.spawnPoints[i]!, i);
    for (const obj of level.objects) this.drawObject(obj);
    if (this.selection) this.drawSelection(this.selection);

    this.updateInfo();
  }

  private drawGrid(mapWidth: number): void {
    this.gridGfx.lineStyle(1, 0x2b4259, 0.18);
    for (let x = 0; x <= mapWidth; x += GRID) this.gridGfx.lineBetween(x, 0, x, VIEW_H);
    for (let y = 0; y <= VIEW_H; y += GRID) this.gridGfx.lineBetween(0, y, mapWidth, y);
    this.gridGfx.lineStyle(2, 0xffffff, 0.22);
    this.gridGfx.strokeRect(0, 0, mapWidth, VIEW_H);
  }

  private drawSolid(rect: SolidRect): void {
    const fill = rect.tileType === 'ground' ? 0x7c4f1e : rect.tileType === 'ice' ? 0x9fd9ff : 0x8f94b8;
    const stroke = rect.tileType === 'ice' ? 0xdff2ff : 0x334155;
    this.levelGfx.fillStyle(fill, 1);
    this.levelGfx.fillRect(rect.x, rect.y - TOP_H, rect.width, rect.height);
    this.levelGfx.lineStyle(2, stroke, 1);
    this.levelGfx.strokeRect(rect.x, rect.y - TOP_H, rect.width, rect.height);
  }

  private drawSpawn(spawn: SpawnPoint, index: number): void {
    const y = spawn.y - TOP_H;
    this.levelGfx.fillStyle(0xffffff, 1);
    this.levelGfx.fillCircle(spawn.x, y, 10);
    this.levelGfx.lineStyle(2, 0x111827, 1);
    this.levelGfx.strokeCircle(spawn.x, y, 10);
    this.levelGfx.fillStyle(0x111827, 1);
    this.levelGfx.fillRect(spawn.x - 3, y - 5, 6, 10);
    void index;
  }

  private drawObject(o: LevelObjectDef): void {
    const y = o.y - TOP_H;
    const left = o.x - o.width / 2;
    const top = y - o.height / 2;
    if (o.type === 'goal') {
      this.levelGfx.fillStyle(0x224466, 1);
      this.levelGfx.fillRoundedRect(left - 6, top - 18, o.width + 12, o.height + 36, 4);
      this.levelGfx.lineStyle(3, 0x88ccff, 1);
      this.levelGfx.strokeRoundedRect(left - 6, top - 18, o.width + 12, o.height + 36, 4);
      return;
    }
    const color = objectColor(o.type);
    if (o.type === 'spike') {
      this.levelGfx.fillStyle(color, 1);
      const count = Math.max(2, Math.floor(o.width / 16));
      for (let i = 0; i < count; i++) {
        const w = o.width / count;
        const x = left + i * w;
        this.levelGfx.fillTriangle(x, top + o.height, x + w / 2, top, x + w, top + o.height);
      }
      return;
    }
    if (o.type === 'vine') {
      this.levelGfx.lineStyle(5, color, 1);
      this.levelGfx.lineBetween(o.x, top, o.x, top + o.height);
      return;
    }
    if (o.type === 'firebar') {
      this.levelGfx.fillStyle(0x332222, 1);
      this.levelGfx.fillCircle(o.x, y, 7);
      this.levelGfx.fillStyle(color, 1);
      const segs = o.segments ?? 3;
      for (let i = 1; i <= segs; i++) this.levelGfx.fillCircle(o.x + i * GRID, y, 10);
      return;
    }
    this.levelGfx.fillStyle(color, 1);
    this.levelGfx.fillRect(left, top, o.width, o.height);
    this.levelGfx.lineStyle(2, 0x111827, 0.75);
    this.levelGfx.strokeRect(left, top, o.width, o.height);
    if (o.type === 'platform' && o.motion) {
      this.levelGfx.lineStyle(2, 0xffcc66, 0.9);
      if (o.motion.axis === 'x') this.levelGfx.lineBetween(o.motion.from, y, o.motion.to, y);
      else this.levelGfx.lineBetween(o.x, o.motion.from - TOP_H, o.x, o.motion.to - TOP_H);
    }
  }

  private drawSelection(selection: Selection): void {
    const b = this.boundsForSelection(selection);
    if (!b) return;
    this.levelGfx.lineStyle(3, 0xffff66, 1);
    this.levelGfx.strokeRect(b.x - 3, b.y - TOP_H - 3, b.width + 6, b.height + 6);
  }

  private drawPalettePreview(pointer: Phaser.Input.Pointer): void {
    this.previewGfx.clear();
    if (!this.isInWorld(pointer.x, pointer.y)) return;
    const world = this.screenToWorld(pointer.x, pointer.y);
    const b = previewBounds(this.drag.kind === 'palette' ? this.drag.item : 'ground', world.x, world.y);
    this.previewGfx.fillStyle(0xffffff, 0.2);
    this.previewGfx.lineStyle(2, 0xffffff, 0.75);
    this.previewGfx.fillRect(b.x, b.y - TOP_H, b.width, b.height);
    this.previewGfx.strokeRect(b.x, b.y - TOP_H, b.width, b.height);
  }

  private hitTest(x: number, y: number): Selection {
    for (let i = this.level.objects.length - 1; i >= 0; i--) {
      const b = objectBounds(this.level.objects[i]!);
      if (pointInRect(x, y, b)) return { kind: 'object', index: i };
    }
    for (let i = this.level.spawnPoints.length - 1; i >= 0; i--) {
      const s = this.level.spawnPoints[i]!;
      if (Math.abs(x - s.x) <= 18 && Math.abs(y - s.y) <= 18) return { kind: 'spawn', index: i };
    }
    for (let i = this.level.solidRects.length - 1; i >= 0; i--) {
      const r = this.level.solidRects[i]!;
      if (pointInRect(x, y, r)) return { kind: 'rect', index: i };
    }
    return null;
  }

  private boundsForSelection(selection: Selection): { x: number; y: number; width: number; height: number } | null {
    if (!selection) return null;
    if (selection.kind === 'rect') return this.level.solidRects[selection.index] ?? null;
    if (selection.kind === 'spawn') {
      const s = this.level.spawnPoints[selection.index];
      return s ? { x: s.x - 16, y: s.y - 16, width: 32, height: 32 } : null;
    }
    const o = this.level.objects[selection.index];
    return o ? objectBounds(o) : null;
  }

  private screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return { x: screenX - LEFT_W + this.cameraOffsetX, y: screenY };
  }

  private isInWorld(screenX: number, screenY: number): boolean {
    return screenX >= LEFT_W && screenX <= GAME_WIDTH - RIGHT_W
      && screenY >= TOP_H && screenY <= GAME_HEIGHT - STATUS_H;
  }

  private mapWidth(): number {
    return this.level.mapWidth ?? GAME_WIDTH;
  }

  private pan(delta: number): void {
    this.cameraOffsetX = clampPan(this.cameraOffsetX + delta, this.mapWidth());
    this.repaint();
  }

  private centerOnGoal(): void {
    const goal = ensureGoal(this.level);
    this.cameraOffsetX = clampPan(goal.x - VIEW_W / 2, this.mapWidth());
    this.repaint();
  }

  private editPackMeta(): void {
    const name = prompt('Pack name:', this.pack.name);
    if (name === null) return;
    const min = prompt('Category: 1, 2, or 4 players:', String(this.pack.minPlayers));
    if (min === null) return;
    this.pushUndo();
    this.pack.name = cleanName(name, 'Custom Pack');
    this.pack.minPlayers = toCategory(min);
    for (const level of this.pack.levels) level.minPlayers = this.pack.minPlayers;
    ensureEveryLevel(this.pack);
    this.afterEdit();
    this.rebuildLevelTabs();
  }

  private editLevelMeta(): void {
    const name = prompt('Level name:', this.level.name);
    if (name === null) return;
    const width = prompt(`Map width (${MIN_MAP_W}-${MAX_MAP_W}, multiple of ${GRID}):`, String(this.mapWidth()));
    if (width === null) return;
    this.pushUndo();
    const nextW = clamp(Math.round((Number(width) || GAME_WIDTH) / GRID) * GRID, MIN_MAP_W, MAX_MAP_W);
    this.level.name = cleanName(name, `Level ${this.levelIndex + 1}`);
    this.level.mapWidth = nextW;
    this.fitLevelToWidth(this.level);
    this.cameraOffsetX = clampPan(this.cameraOffsetX, nextW);
    this.afterEdit();
    this.rebuildLevelTabs();
  }

  private fitLevelToWidth(level: LevelData): void {
    const w = level.mapWidth ?? GAME_WIDTH;
    for (const r of level.solidRects) {
      r.x = clamp(r.x, 0, Math.max(0, w - r.width));
      if (r.y === FLOOR_TOP && r.x === 0) r.width = Math.min(Math.max(r.width, w), w);
    }
    for (const s of level.spawnPoints) s.x = clamp(s.x, TILE_SIZE / 2, w - TILE_SIZE / 2);
    for (const o of level.objects) o.x = clamp(o.x, o.width / 2, w - o.width / 2);
  }

  private showSetup(): void {
    this.setupActive = true;
    this.setupGroup.clear(true, true);
    const add = (obj: Phaser.GameObjects.GameObject): void => {
      obj.setDepth(200);
      this.setupGroup.add(obj);
    };

    add(this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x020617, 0.9).setOrigin(0).setInteractive());
    add(this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 680, 500, 0x111827, 1).setStrokeStyle(2, 0x38bdf8));
    add(this.add.text(GAME_WIDTH / 2, 128, 'CREATE LEVEL PACK', {
      ...FONT, fontSize: '22px', color: '#ffffff',
    }).setOrigin(0.5));
    add(this.add.text(GAME_WIDTH / 2, 160, 'Choose the pack shape before editing. Each level starts with spawns and one goal.', {
      ...FONT, fontSize: '8px', color: '#94a3b8',
    }).setOrigin(0.5));

    const state = {
      name: this.pack.name,
      minPlayers: this.pack.minPlayers,
      count: this.pack.levels.length,
      width: this.pack.levels[0]?.mapWidth ?? GAME_WIDTH,
    };

    const nameText = this.add.text(GAME_WIDTH / 2, 216, state.name, {
      ...FONT, fontSize: '14px', color: '#ffff99',
      backgroundColor: '#0f172a',
      padding: { left: 14, right: 14, top: 8, bottom: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    nameText.on('pointerdown', () => {
      const next = prompt('Pack name:', state.name);
      if (next !== null) {
        state.name = cleanName(next, 'Custom Pack');
        nameText.setText(state.name);
      }
    });
    add(nameText);

    this.setupCards(246, 'PLAYERS', [
      { value: 1, label: '1+' },
      { value: 2, label: '2+' },
      { value: 4, label: '4+' },
    ], () => state.minPlayers, (v) => { state.minPlayers = v as 1 | 2 | 4; }, add);

    this.setupCards(326, 'LEVELS', [
      { value: 2, label: '2' },
      { value: 3, label: '3' },
      { value: 4, label: '4' },
      { value: 5, label: '5' },
    ], () => state.count, (v) => { state.count = v; }, add);

    this.setupCards(406, 'WIDTH', [
      { value: 1280, label: '1280' },
      { value: 1920, label: '1920' },
      { value: 2560, label: '2560' },
      { value: 3200, label: '3200' },
    ], () => state.width, (v) => { state.width = v; }, add);

    const start = this.add.text(GAME_WIDTH / 2, 540, 'START BUILDING', {
      ...FONT, fontSize: '14px', color: '#00ff88',
      backgroundColor: '#064e3b',
      padding: { left: 24, right: 24, top: 10, bottom: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    start.on('pointerover', () => start.setColor('#ffffff'));
    start.on('pointerout', () => start.setColor('#00ff88'));
    start.on('pointerdown', () => {
      this.pack = makePackFromSetup(state.name, state.minPlayers, state.count, state.width);
      this.levelIndex = 0;
      this.selection = null;
      this.cameraOffsetX = 0;
      this.setupActive = false;
      this.setupGroup.clear(true, true);
      this.rebuildLevelTabs();
      this.rebuildInspector();
      this.repaint();
      this.setStatus('Pack ready. Drag pieces from the left. Movement snaps every 8px for fine placement.', '#00ff88');
    });
    add(start);
  }

  private setupCards(
    y: number,
    title: string,
    opts: Array<{ value: number; label: string }>,
    get: () => number,
    set: (value: number) => void,
    add: (obj: Phaser.GameObjects.GameObject) => void,
  ): void {
    add(this.add.text(348, y, title, { ...FONT, fontSize: '9px', color: '#94a3b8' }).setOrigin(1, 0.5));
    const cards: Phaser.GameObjects.Text[] = [];
    opts.forEach((opt, i) => {
      const card = this.add.text(374 + i * 76, y, opt.label, {
        ...FONT,
        fontSize: '11px',
        color: get() === opt.value ? '#ffffff' : '#94a3b8',
        backgroundColor: get() === opt.value ? '#1d4ed8' : '#1f2937',
        padding: { left: 12, right: 12, top: 8, bottom: 8 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      card.on('pointerdown', () => {
        set(opt.value);
        cards.forEach((c, ci) => {
          const active = opts[ci]!.value === get();
          c.setColor(active ? '#ffffff' : '#94a3b8');
          c.setBackgroundColor(active ? '#1d4ed8' : '#1f2937');
        });
      });
      cards.push(card);
      add(card);
    });
  }

  private confirmNewPack(): void {
    if (!confirm('Discard the current pack and create a new one?')) return;
    this.pack = blankPack();
    this.levelIndex = 0;
    this.selection = null;
    this.undoStack = [];
    this.redoStack = [];
    this.rebuildLevelTabs();
    this.rebuildInspector();
    this.repaint();
    this.showSetup();
  }

  private async savePack(): Promise<void> {
    const acct = loadStoredAccount();
    if (!acct || acct.role !== 'admin' || !acct.password) {
      this.setStatus('Log in again as admin before saving.', '#ff7777');
      return;
    }
    ensureEveryLevel(this.pack);
    const issues = validatePackClient(this.pack);
    const fatal = issues.find((i) => i.startsWith('ERROR'));
    if (fatal) {
      this.setStatus(fatal, '#ff7777');
      this.refreshIssues();
      return;
    }

    this.setStatus('Saving pack...', '#ffff99');
    try {
      const res = await fetch(`${HTTP_URL}/admin/packs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: acct.username, password: acct.password, pack: this.pack }),
      });
      const body = await res.json() as { pack?: { slug: string; data: LevelPack }; error?: string };
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      if (body.pack?.data) this.pack = clonePack(body.pack.data);
      this.rebuildLevelTabs();
      this.repaint();
      this.setStatus(`Saved "${this.pack.name}". It appears in the lobby custom pack list.`, '#00ff88');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown error';
      this.setStatus(`Save failed: ${msg}`, '#ff7777');
    }
  }

  private async loadPacks(): Promise<void> {
    const acct = loadStoredAccount();
    if (!acct || acct.role !== 'admin' || !acct.password) {
      this.setStatus('Log in again as admin before loading.', '#ff7777');
      return;
    }
    this.setStatus('Loading packs...', '#ffff99');
    try {
      const res = await fetch(`${HTTP_URL}/admin/packs`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-username': acct.username,
          'x-auth-password': acct.password,
        },
      });
      const body = await res.json() as { packs?: Array<{ slug: string; data: LevelPack; updatedAt: string }>; error?: string };
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      this.showLoadModal(body.packs ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown error';
      this.setStatus(`Load failed: ${msg}`, '#ff7777');
    }
  }

  private showLoadModal(packs: Array<{ slug: string; data: LevelPack; updatedAt: string }>): void {
    if (packs.length === 0) {
      this.setStatus('No saved packs yet.', '#94a3b8');
      return;
    }
    const depth = 220;
    const items: Phaser.GameObjects.GameObject[] = [];
    const close = (): void => items.forEach((i) => i.destroy());
    const overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.72).setOrigin(0).setDepth(depth).setInteractive();
    const panel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 640, Math.min(520, 110 + packs.length * 42), 0x111827, 1)
      .setDepth(depth + 1).setStrokeStyle(2, 0x38bdf8);
    const title = this.add.text(GAME_WIDTH / 2, panel.y - panel.height / 2 + 24, 'LOAD PACK', {
      ...FONT, fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(depth + 2);
    items.push(overlay, panel, title);
    packs.forEach((entry, i) => {
      const y = panel.y - panel.height / 2 + 64 + i * 42;
      const row = this.add.rectangle(GAME_WIDTH / 2, y, 560, 34, 0x1f2937, 1)
        .setDepth(depth + 2).setStrokeStyle(1, 0x334155).setInteractive({ useHandCursor: true });
      const text = this.add.text(GAME_WIDTH / 2, y, `${entry.data.name} | ${entry.data.levels.length} levels | ${entry.data.minPlayers}+ players`, {
        ...FONT, fontSize: '9px', color: '#dbeafe',
      }).setOrigin(0.5).setDepth(depth + 3);
      row.on('pointerover', () => row.setFillStyle(0x26364f));
      row.on('pointerout', () => row.setFillStyle(0x1f2937));
      row.on('pointerdown', () => {
        close();
        this.pack = clonePack(entry.data);
        this.levelIndex = 0;
        this.selection = null;
        this.cameraOffsetX = 0;
        ensureEveryLevel(this.pack);
        this.rebuildLevelTabs();
        this.rebuildInspector();
        this.repaint();
        this.setStatus(`Loaded "${this.pack.name}".`, '#00ff88');
      });
      items.push(row, text);
    });
    overlay.on('pointerdown', close);
  }

  private undo(): void {
    const snap = this.undoStack.pop();
    if (!snap) return;
    this.redoStack.push(JSON.stringify(this.pack));
    this.restoreSnapshot(snap);
  }

  private redo(): void {
    const snap = this.redoStack.pop();
    if (!snap) return;
    this.undoStack.push(JSON.stringify(this.pack));
    this.restoreSnapshot(snap);
  }

  private pushUndo(): void {
    this.undoStack.push(JSON.stringify(this.pack));
    if (this.undoStack.length > this.UNDO_LIMIT) this.undoStack.shift();
    this.redoStack = [];
  }

  private pushUndoSnapshotIfChanged(): void {
    const now = JSON.stringify(this.pack);
    const prev = this.undoStack[this.undoStack.length - 1];
    if (prev === now) this.undoStack.pop();
    else this.redoStack = [];
  }

  private restoreSnapshot(raw: string): void {
    this.pack = JSON.parse(raw) as PackDoc;
    this.levelIndex = clamp(this.levelIndex, 0, this.pack.levels.length - 1);
    this.selection = null;
    ensureEveryLevel(this.pack);
    this.rebuildLevelTabs();
    this.rebuildInspector();
    this.repaint();
  }

  private afterEdit(): void {
    ensureEveryLevel(this.pack);
    this.rebuildInspector();
    this.repaint();
    this.refreshIssues();
  }

  private refreshIssues(): void {
    if (!this.issuesText) return;
    const issues = validateLevelClient(this.level, this.pack.minPlayers);
    if (issues.length === 0) {
      this.issuesText.setText('Ready: goal, spawns and links look good.');
      this.issuesText.setColor('#00ff88');
    } else {
      this.issuesText.setText(issues.slice(0, 4).join('\n'));
      this.issuesText.setColor(issues.some((i) => i.startsWith('ERROR')) ? '#ff7777' : '#ffcc66');
    }
  }

  private updateInfo(): void {
    this.packTitle.setText(`${this.pack.name} | ${this.pack.levels.length} levels | ${this.pack.minPlayers}+ players`);
    this.refreshIssues();
  }

  private setStatus(text: string, color = '#94a3b8'): void {
    this.statusText.setText(text);
    this.statusText.setColor(color);
  }
}

function buttonStyle(color: string): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    ...FONT,
    fontSize: '10px',
    color,
    backgroundColor: '#26364f',
    padding: { left: 8, right: 8, top: 4, bottom: 4 },
  };
}

function blankPack(): PackDoc {
  return makePackFromSetup('Custom Pack', 1, 2, GAME_WIDTH);
}

function makePackFromSetup(name: string, minPlayers: 1 | 2 | 4, count: number, width: number): PackDoc {
  const pack: PackDoc = {
    id: '',
    name: cleanName(name, 'Custom Pack'),
    minPlayers,
    levels: [],
  };
  for (let i = 0; i < count; i++) {
    pack.levels.push(blankLevel(i, minPlayers, width));
  }
  return pack;
}

function blankLevel(index: number, minPlayers: number, mapWidth: number): LevelData {
  return {
    id: -Date.now() - index,
    name: `Level ${index + 1}`,
    minPlayers,
    mapWidth,
    solidRects: [{ x: 0, y: FLOOR_TOP, width: mapWidth, height: TILE_SIZE, tileType: 'ground' }],
    spawnPoints: standardSpawns(),
    objects: [{
      id: `l${index + 1}_goal`,
      type: 'goal',
      x: mapWidth - 96,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    }],
  };
}

function standardSpawns(): SpawnPoint[] {
  return Array.from({ length: MAX_PLAYERS }, (_, i) => ({ x: 48 + i * 64, y: PLAYER_ON_FLOOR }));
}

function clonePack(pack: LevelPack): PackDoc {
  return {
    id: pack.id,
    name: pack.name,
    minPlayers: toCategory(pack.minPlayers),
    levels: pack.levels.map((level) => ({
      ...level,
      solidRects: level.solidRects.map((r) => ({ ...r })),
      spawnPoints: level.spawnPoints.map((s) => ({ ...s })),
      objects: level.objects.map((o) => ({ ...o, motion: o.motion ? { ...o.motion } : undefined })),
    })),
  };
}

function objectFor(kind: PaletteKind, id: string, x: number, y: number, level: LevelData): LevelObjectDef {
  const floorX = clamp(x, 16, level.mapWidth ?? GAME_WIDTH);
  switch (kind) {
    case 'button':
      return { id, type: 'button', x: floorX, y: PLAYER_ON_FLOOR, width: TILE_SIZE, height: 8, requiredPlayers: 1, linkedId: firstDoorId(level), latching: false };
    case 'door':
      return { id, type: 'door', x: floorX, y: GAME_HEIGHT / 2, width: 16, height: GAME_HEIGHT, requiredPlayers: 0, linkedId: '' };
    case 'trap':
      return { id, type: 'trap', x: floorX, y: FLOOR_TOP + 4, width: 96, height: 16, requiredPlayers: 0, linkedId: '' };
    case 'spike':
      return { id, type: 'spike', x: floorX, y: FLOOR_TOP - 8, width: 96, height: 16, requiredPlayers: 0, linkedId: '' };
    case 'spring':
      return { id, type: 'spring', x: floorX, y: FLOOR_TOP - 8, width: 48, height: 16, requiredPlayers: 0, linkedId: '' };
    case 'movingPlatform': {
      const from = floorX;
      const to = Math.min((level.mapWidth ?? GAME_WIDTH) - 96, from + 192);
      return { id, type: 'platform', x: from, y, width: 128, height: TILE_SIZE, requiredPlayers: 0, linkedId: '', motion: { axis: 'x', from, to, speed: 80 } };
    }
    case 'crumble':
      return { id, type: 'crumble', x: floorX, y, width: 128, height: TILE_SIZE, requiredPlayers: 0, linkedId: '' };
    case 'firebar':
      return { id, type: 'firebar', x: floorX, y, width: TILE_SIZE, height: TILE_SIZE, requiredPlayers: 0, linkedId: '', segments: 3, power: 2, angleDeg: 0 };
    case 'box':
      return { id, type: 'box', x: floorX, y: PLAYER_ON_FLOOR, width: TILE_SIZE, height: TILE_SIZE, requiredPlayers: 0, linkedId: '' };
    case 'lavawall':
      return { id, type: 'lavawall', x: floorX, y: GAME_HEIGHT / 2, width: 48, height: GAME_HEIGHT, requiredPlayers: 0, linkedId: '', speed: 100 };
    case 'vine':
      return { id, type: 'vine', x: floorX, y, width: 48, height: 160, requiredPlayers: 0, linkedId: '', speed: 560, power: -720 };
    default:
      return { id, type: 'spring', x: floorX, y, width: 48, height: 16, requiredPlayers: 0, linkedId: '' };
  }
}

function previewBounds(kind: PaletteKind, x: number, y: number): { x: number; y: number; width: number; height: number } {
  if (kind === 'ground') return { x: snapX(x), y: snapY(y), width: GRID * 6, height: GRID };
  if (kind === 'platform' || kind === 'ice') return { x: snapX(x), y: snapY(y), width: GRID * 4, height: GRID };
  if (kind === 'spawn') return { x: snapX(x) - 16, y: snapY(y) - 16, width: 32, height: 32 };
  if (kind === 'goal') return { x: snapX(x) - 26, y: snapY(y) - 40, width: 52, height: 80 };
  const obj = objectFor(kind, 'preview', snapX(x), snapY(y), { id: 0, name: '', minPlayers: 1, mapWidth: GAME_WIDTH, solidRects: [], spawnPoints: [], objects: [] });
  return objectBounds(obj);
}

function objectBounds(o: LevelObjectDef): { x: number; y: number; width: number; height: number } {
  if (o.type === 'goal') return { x: o.x - Math.max(o.width, 40) / 2 - 6, y: o.y - Math.max(o.height * 2, 80) / 2, width: Math.max(o.width, 40) + 12, height: Math.max(o.height * 2, 80) };
  if (o.type === 'firebar') return { x: o.x - 12, y: o.y - 12, width: ((o.segments ?? 3) + 1) * GRID, height: 24 };
  return { x: o.x - o.width / 2, y: o.y - o.height / 2, width: o.width, height: o.height };
}

function ensureEveryLevel(pack: PackDoc): void {
  for (const level of pack.levels) {
    level.minPlayers = pack.minPlayers;
    level.mapWidth = level.mapWidth ?? GAME_WIDTH;
    if (level.spawnPoints.length < MAX_PLAYERS) level.spawnPoints = [...level.spawnPoints, ...standardSpawns().slice(level.spawnPoints.length)];
    ensureGoal(level);
  }
}

function ensureGoal(level: LevelData): LevelObjectDef {
  let goals = level.objects.filter((o) => o.type === 'goal');
  if (goals.length === 0) {
    level.objects.push({
      id: makeId(level, 'goal'),
      type: 'goal',
      x: (level.mapWidth ?? GAME_WIDTH) - 96,
      y: PLAYER_ON_FLOOR,
      width: TILE_SIZE,
      height: TILE_SIZE,
      requiredPlayers: 0,
      linkedId: '',
    });
    goals = level.objects.filter((o) => o.type === 'goal');
  }
  for (const extra of goals.slice(1)) level.objects.splice(level.objects.indexOf(extra), 1);
  return goals[0]!;
}

function validatePackClient(pack: PackDoc): string[] {
  const issues: string[] = [];
  if (pack.levels.length < 2 || pack.levels.length > 5) issues.push('ERROR: Pack needs 2 to 5 levels.');
  pack.levels.forEach((level, i) => {
    for (const issue of validateLevelClient(level, pack.minPlayers)) issues.push(`L${i + 1} ${issue}`);
  });
  return issues;
}

function validateLevelClient(level: LevelData, minPlayers: number): string[] {
  const issues: string[] = [];
  const goals = level.objects.filter((o) => o.type === 'goal');
  if (goals.length !== 1) issues.push('ERROR: exactly one goal is required.');
  if (level.spawnPoints.length < minPlayers) issues.push(`ERROR: needs at least ${minPlayers} spawn points.`);
  const ids = new Set<string>();
  for (const o of level.objects) {
    if (ids.has(o.id)) issues.push(`ERROR: duplicate object id ${o.id}.`);
    ids.add(o.id);
  }
  const buttons = level.objects.filter((o) => o.type === 'button');
  for (const door of level.objects.filter((o) => o.type === 'door')) {
    if (!buttons.some((b) => b.linkedId === door.id)) issues.push(`ERROR: door ${door.id} needs a linked button.`);
  }
  const goal = goals[0];
  if (goal && (goal.x < 0 || goal.x > (level.mapWidth ?? GAME_WIDTH))) issues.push('ERROR: goal is outside map width.');
  if (level.solidRects.length === 0) issues.push('ERROR: add at least one floor or platform.');
  return issues;
}

function makeId(level: LevelData, kind: string): string {
  const safe = kind.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  let i = level.objects.length + level.solidRects.length + level.spawnPoints.length + 1;
  let id = `${safe}_${i}`;
  const used = new Set(level.objects.map((o) => o.id));
  while (used.has(id)) id = `${safe}_${++i}`;
  return id;
}

function firstDoorId(level: LevelData): string {
  return level.objects.find((o) => o.type === 'door')?.id ?? '';
}

function nextDoorId(level: LevelData, current: string): string {
  const doors = level.objects.filter((o) => o.type === 'door').map((o) => o.id);
  if (doors.length === 0) return '';
  const idx = doors.indexOf(current);
  return doors[(idx + 1) % doors.length] ?? '';
}

function linkFirstUnlinkedButton(level: LevelData, doorId: string): void {
  const button = level.objects.find((o) => o.type === 'button' && !o.linkedId);
  if (button) button.linkedId = doorId;
}

function syncMotionToObject(o: LevelObjectDef): void {
  if (!o.motion) return;
  const dist = Math.max(GRID, Math.abs(o.motion.to - o.motion.from));
  if (o.motion.axis === 'x') {
    o.motion.from = o.x;
    o.motion.to = o.x + dist;
  } else {
    o.motion.from = o.y;
    o.motion.to = o.y + dist;
  }
}

function changeMotionRange(o: LevelObjectDef, delta: number): void {
  if (!o.motion) return;
  const sign = o.motion.to >= o.motion.from ? 1 : -1;
  o.motion.to = o.motion.from + sign * Math.max(GRID, Math.abs(o.motion.to - o.motion.from) + delta);
}

function objectColor(type: string): number {
  switch (type) {
    case 'button': return 0xff9900;
    case 'door': return 0xcc3333;
    case 'trap': return 0xff5500;
    case 'spring': return 0x22cc88;
    case 'platform': return 0xc88c32;
    case 'firebar': return 0xff4400;
    case 'crumble': return 0xa88060;
    case 'lavawall': return 0xff3300;
    case 'vine': return 0x5bc06b;
    case 'spike': return 0xd8d8e8;
    case 'box': return 0xb87333;
    default: return 0xffffff;
  }
}

function nextTile(t: TileType): TileType {
  return t === 'ground' ? 'platform' : t === 'platform' ? 'ice' : 'ground';
}

function toCategory(value: unknown): 1 | 2 | 4 {
  const n = Number(value);
  if (n >= 4) return 4;
  if (n >= 2) return 2;
  return 1;
}

function cleanName(value: string, fallback: string): string {
  const trimmed = value.trim().slice(0, 40);
  return trimmed || fallback;
}

function pointInRect(x: number, y: number, r: { x: number; y: number; width: number; height: number }): boolean {
  return x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height;
}

function snapX(x: number): number { return Math.round(x / SNAP) * SNAP; }
function snapY(y: number): number { return Math.round(y / SNAP) * SNAP; }

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clampPan(offset: number, mapWidth: number): number {
  return clamp(offset, 0, Math.max(0, mapWidth - VIEW_W));
}
