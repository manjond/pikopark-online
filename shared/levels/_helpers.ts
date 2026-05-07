/**
 * Level-construction helpers. Eliminates duplication across level files and
 * provides a static validator that catches structural bugs (missing goals,
 * broken linkedIds, and the classic "pressure buttons requiring N simultaneous
 * holders with minPlayers == N" trap that made several levels unsolvable).
 *
 * Designed to be used by all `levelN.ts` files. Each level can either build
 * its objects by hand as before or use the `floorButton` / `platformButton`
 * / `fullHeightDoor` / `goalOnFloor` / `goalOnPlatform` / `floorTrap` /
 * `floorSpring` / `groundRect` / `platformRect` / `standardSpawns` factories.
 *
 * Physics reachability constants are derived from the real gravity/jump
 * constants in `../constants.ts` — never hand-type 421/389/357/72 again.
 */

import {
  GAME_HEIGHT,
  GAME_WIDTH,
  GRAVITY,
  JUMP_VELOCITY,
  MOVE_SPEED,
  SPRING_VELOCITY,
  TILE_SIZE,
} from '../constants';
import type { LevelData, LevelObjectDef, LevelPack, PlatformMotion, SolidRect, SpawnPoint } from '../level';

// ─── Core Y-coordinates ───────────────────────────────────────────────────────

/** Top edge of the floor ground rectangle. */
export const FLOOR_TOP = GAME_HEIGHT - TILE_SIZE;           // 688

/** Player center y when standing on the floor. */
export const PLAYER_ON_FLOOR = FLOOR_TOP - TILE_SIZE / 2;    // 672

// ─── Reachability physics ─────────────────────────────────────────────────────
// feet_peak_y = initial_center_y + TILE/2 − (v² / 2g)
// A platform with top-y ≥ feet_peak is reachable from the given launch.
// A platform with top-y < feet_peak is NOT reachable.

const JUMP_RISE   = (JUMP_VELOCITY   * JUMP_VELOCITY)   / (2 * GRAVITY);
const SPRING_RISE = (SPRING_VELOCITY * SPRING_VELOCITY) / (2 * GRAVITY);

/** Solo jump from the floor — platforms at y ≥ this are solo-reachable. */
export const SOLO_FEET_PEAK = Math.round(
  PLAYER_ON_FLOOR + TILE_SIZE / 2 - JUMP_RISE,
); // 421

/** 2-player stack jump — platforms in [STACK2, SOLO) require stacking. */
export const STACK2_FEET_PEAK = Math.round(
  PLAYER_ON_FLOOR - TILE_SIZE + TILE_SIZE / 2 - JUMP_RISE,
); // 389

/** 3-player stack jump — platforms in [STACK3, STACK2) require a 3-stack. */
export const STACK3_FEET_PEAK = Math.round(
  PLAYER_ON_FLOOR - 2 * TILE_SIZE + TILE_SIZE / 2 - JUMP_RISE,
); // 357

/**
 * Spring-launch from a floor-mounted spring pad (height 16, on floor).
 * Platforms in [SPRING, STACK3) require a spring.
 */
export const SPRING_FEET_PEAK = Math.round(
  (FLOOR_TOP - TILE_SIZE) + TILE_SIZE / 2 - SPRING_RISE,
); // 72

/**
 * Throw-launch feet peak from a floor-standing carrier. The rider is pinned
 * at carrier.y - TILE_SIZE while carried, then thrown with JUMP_VELOCITY*1.15.
 * Platforms in [THROW_FEET_PEAK, STACK3_FEET_PEAK) require a throw — stacking
 * is too short, and solo/2-stack are way too short. Keep this constant in
 * sync with THROW_VY inside GameRoom.processCarryInputs (MOVE_SPEED*1.3 for
 * horizontal, JUMP_VELOCITY*1.15 for vertical).
 */
const THROW_VY_MAGNITUDE = Math.abs(JUMP_VELOCITY) * 1.15;
const THROW_RISE = (THROW_VY_MAGNITUDE * THROW_VY_MAGNITUDE) / (2 * GRAVITY);
export const THROW_FEET_PEAK = Math.round(
  (PLAYER_ON_FLOOR - TILE_SIZE) + TILE_SIZE / 2 - THROW_RISE,
); // ~303

/**
 * Rough horizontal distance a thrown rider covers between release and landing
 * back at floor level. Useful for placing throw-target platforms — expect
 * practical landing spots ~200–550 px from the carrier depending on how high
 * the rider lands. Derived from MOVE_SPEED*1.3 × full air time.
 */
export const THROW_HORIZONTAL_MAX = Math.round(MOVE_SPEED * 1.3 * (2 * THROW_VY_MAGNITUDE) / GRAVITY); // ~598

// ─── Solid-rect factories ─────────────────────────────────────────────────────

/** Full-width ground floor. Defaults to the base game width. */
export function groundRect(mapWidth: number = GAME_WIDTH): SolidRect {
  return { x: 0, y: FLOOR_TOP, width: mapWidth, height: TILE_SIZE, tileType: 'ground' };
}

/** A single floating platform at the given top-left corner. */
export function platformRect(x: number, yTop: number, width: number): SolidRect {
  return { x, y: yTop, width, height: TILE_SIZE, tileType: 'platform' };
}

// ─── Spawn-point factory ──────────────────────────────────────────────────────

/**
 * 4 spawns in a row on the floor — the conventional lobby layout.
 * Override `count`, `startX`, or `gap` only when a level needs custom spacing.
 */
export function standardSpawns(
  count: number = 4,
  startX: number = 48,
  gap: number = 64,
): SpawnPoint[] {
  return Array.from({ length: count }, (_, i) => ({
    x: startX + i * gap,
    y: PLAYER_ON_FLOOR,
  }));
}

// ─── Interactive-object factories ─────────────────────────────────────────────

export interface ButtonOpts {
  latching?: boolean;
  requiredPlayers?: number;
  /** Override the horizontal hit-box width (defaults to TILE_SIZE for floor, full platform width for platform buttons). */
  width?: number;
  /**
   * Override the vertical distance from the platform top to the button center.
   * Default TILE_SIZE/2 (16) floats the button 12px above the platform top —
   * matches levels 1-25. Bounce pack (27/28) uses 4 to sit the button flush on
   * the platform; pass `yOffset: 4` for that look.
   */
  yOffset?: number;
}

function buttonWithLatching(
  base: LevelObjectDef,
  opts?: ButtonOpts,
): LevelObjectDef {
  if (opts?.latching) base.latching = true;
  return base;
}

/** Floor-mounted pressure/latching button. */
export function floorButton(
  id: string,
  x: number,
  linkedId: string,
  opts?: ButtonOpts,
): LevelObjectDef {
  return buttonWithLatching({
    id,
    type: 'button',
    x,
    y: PLAYER_ON_FLOOR,
    width: opts?.width ?? TILE_SIZE,
    height: 8,
    requiredPlayers: opts?.requiredPlayers ?? 1,
    linkedId,
  }, opts);
}

/** Button sitting on top of a platform — width matches the platform by default. */
export function platformButton(
  id: string,
  platform: SolidRect,
  linkedId: string,
  opts?: ButtonOpts,
): LevelObjectDef {
  return buttonWithLatching({
    id,
    type: 'button',
    x: platform.x + platform.width / 2,
    y: platform.y - (opts?.yOffset ?? TILE_SIZE / 2),
    width: opts?.width ?? platform.width,
    height: 8,
    requiredPlayers: opts?.requiredPlayers ?? 1,
    linkedId,
  }, opts);
}

/** Full-screen-height door barrier. */
export function fullHeightDoor(
  id: string,
  x: number,
  linkedId: string = '',
): LevelObjectDef {
  return {
    id,
    type: 'door',
    x,
    y: Math.round(GAME_HEIGHT / 2),
    width: 16,
    height: GAME_HEIGHT,
    requiredPlayers: 0,
    linkedId,
  };
}

/**
 * Floor-mounted lava strip. `width` is the danger strip length in pixels.
 * The lava is rendered flush with the floor surface — its top edge sits at
 * FLOOR_TOP, so visually it replaces the top of the ground tile. It still
 * overlaps a player walking over it enough to trigger the trap.
 */
export function floorTrap(
  id: string,
  x: number,
  width: number = 96,
  linkedId: string = '',
): LevelObjectDef {
  const LAVA_HEIGHT = 16; // half a tile — sits in the top of the ground band
  return {
    id,
    type: 'trap',
    x,
    y: FLOOR_TOP + LAVA_HEIGHT / 2 - 4, // top = FLOOR_TOP - 4; bottom slightly into floor
    width,
    height: LAVA_HEIGHT,
    requiredPlayers: 0,
    linkedId,
  };
}

/** Floor-mounted spring pad. Pass `power` to override SPRING_VELOCITY. */
export function floorSpring(
  id: string,
  x: number,
  width: number = 48,
  power?: number,
): LevelObjectDef {
  const obj: LevelObjectDef = {
    id,
    type: 'spring',
    x,
    y: FLOOR_TOP - 8, // center (height=16, sits on floor)
    width,
    height: 16,
    requiredPlayers: 0,
    linkedId: '',
  };
  if (power !== undefined) obj.power = power;
  return obj;
}

/** Goal on the floor (player walks right into it). */
export function goalOnFloor(id: string, x: number): LevelObjectDef {
  return {
    id,
    type: 'goal',
    x,
    y: PLAYER_ON_FLOOR,
    width: TILE_SIZE,
    height: TILE_SIZE,
    requiredPlayers: 0,
    linkedId: '',
  };
}

/**
 * Moving platform — acts as a one-way solid rect that oscillates linearly
 * between two points. Players standing on top are carried along.
 *
 * `startX`/`yTop` describes the top-left at the start of motion (matching
 * platformRect), `width` is the platform width. Motion is in center-coordinates
 * — e.g. horizontal motion from x=400 to x=800 means the center travels that
 * range, so set the initial `startX` such that its center equals `motion.from`.
 */
export function movingPlatform(
  id: string,
  startX: number,
  yTop: number,
  width: number,
  motion: PlatformMotion,
): LevelObjectDef {
  return {
    id,
    type: 'platform',
    x: startX + width / 2,
    y: yTop + TILE_SIZE / 2,
    width,
    height: TILE_SIZE,
    requiredPlayers: 0,
    linkedId: '',
    motion,
  };
}

/**
 * Ice platform — blocks like a platform but players retain horizontal
 * velocity after releasing movement keys (low-friction sliding). Use for
 * puzzles where precision stopping is the challenge.
 */
export function icePlatform(x: number, yTop: number, width: number): SolidRect {
  return { x, y: yTop, width, height: TILE_SIZE, tileType: 'ice' };
}

/**
 * Fire bar — a rotating bar of fire segments pivoting around (x, y).
 * Each segment is one tile long and kills on touch. `speedRadPerSec` sign
 * chooses rotation direction (positive = counter-clockwise).
 *
 * Hit-test uses the line from pivot to tip, so the visual and hitbox match.
 */
export function fireBar(
  id: string,
  x: number,
  y: number,
  segments: number = 3,
  speedRadPerSec: number = 2,
  startAngleDeg: number = 0,
): LevelObjectDef {
  return {
    id,
    type: 'firebar',
    x,
    y,
    width: TILE_SIZE,     // used for the pivot visual
    height: TILE_SIZE,
    requiredPlayers: 0,
    linkedId: '',
    segments: Math.max(1, Math.min(8, Math.floor(segments))),
    angleDeg: startAngleDeg,
    power: speedRadPerSec, // reuse power field for rotation rate
  };
}

/**
 * Crumbling platform — acts as a solid platform until a player stands on it,
 * then shakes for ~300 ms, falls (becomes non-solid) for ~2 s, and respawns.
 * Server owns the state machine; clients render phase-based visuals.
 */
export function crumblePlatform(
  id: string,
  x: number,
  yTop: number,
  width: number = TILE_SIZE * 3,
): LevelObjectDef {
  return {
    id,
    type: 'crumble',
    x: x + width / 2,
    y: yTop + TILE_SIZE / 2,
    width,
    height: TILE_SIZE,
    requiredPlayers: 0,
    linkedId: '',
  };
}

/** Goal centered on top of a platform. */
export function goalOnPlatform(id: string, platform: SolidRect): LevelObjectDef {
  return {
    id,
    type: 'goal',
    x: platform.x + platform.width / 2,
    y: platform.y - TILE_SIZE / 2,
    width: TILE_SIZE,
    height: TILE_SIZE,
    requiredPlayers: 0,
    linkedId: '',
  };
}

/**
 * Crumbling platform that does NOT respawn — once fallen, the gap is permanent.
 * Use for puzzles where order and irreversibility are the challenge.
 */
export function crumbleNoRespawn(
  id: string,
  x: number,
  yTop: number,
  width: number = TILE_SIZE * 3,
): LevelObjectDef {
  return {
    id,
    type: 'crumble',
    x: x + width / 2,
    y: yTop + TILE_SIZE / 2,
    width,
    height: TILE_SIZE,
    requiredPlayers: 0,
    linkedId: '',
    noRespawn: true,
  };
}

/**
 * A lava wall that moves horizontally at `speed` px/s (positive = rightward).
 * Starting position `x` is the center of the wall. Players touched by the
 * wall die and the level restarts. Use to create time-pressure runs.
 * Typical speed: 80–140 px/s. Map should be wide enough to complete before
 * the wall reaches the exit.
 */
export function lavaWall(
  id: string,
  x: number,
  speed: number = 100,
  width: number = 48,
): LevelObjectDef {
  return {
    id,
    type: 'lavawall',
    x,
    y: GAME_HEIGHT / 2,
    width,
    height: GAME_HEIGHT,
    requiredPlayers: 0,
    linkedId: '',
    speed,
  };
}

/**
 * A pushable wooden crate. Players push it by walking into it; it falls with
 * gravity and can land on buttons to activate them. Width and height default
 * to one tile (32×32).
 */
export function pushBox(
  id: string,
  x: number,
  yTop: number,
  size: number = TILE_SIZE,
): LevelObjectDef {
  return {
    id,
    type: 'box',
    x: x + size / 2,
    y: yTop + size / 2,
    width: size,
    height: size,
    requiredPlayers: 0,
    linkedId: '',
  };
}

/**
 * A ground-level segment (partial floor). Use multiple `groundSegment` calls
 * instead of a single `groundRect()` to create pits/gaps that players can
 * fall into (fall-off triggers a level restart server-side).
 */
export function groundSegment(x: number, width: number): SolidRect {
  return { x, y: FLOOR_TOP, width, height: TILE_SIZE, tileType: 'ground' };
}

// ─── Level validator ──────────────────────────────────────────────────────────

export interface ValidationIssue {
  severity: 'error' | 'warning';
  pack: string;
  level: number;
  levelName: string;
  message: string;
}

/**
 * Static solvability + structural checks for a single level.
 *
 *   • Exactly one goal exists.
 *   • Every non-empty `linkedId` resolves to another object in this level.
 *   • Spawn points are inside the map width.
 *   • No duplicate object IDs.
 *   • Pressure-only AND-group: if every button linked to the same door is
 *     non-latching AND `sum(requiredPlayers) >= effectiveMinPlayers`, then
 *     every player in the minimum-size session is forced to hold a button
 *     and nobody can cross the door — the level is unsolvable.
 *     (This is exactly the bug fixed on 2026-04-18 across 9 levels.)
 *
 * `effectiveMinPlayers` is max(pack.minPlayers, level.minPlayers) since the
 * server gates startGame on the pack value.
 */
export function validateLevel(
  level: LevelData,
  effectiveMinPlayers: number,
  packId: string = '',
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const mapW = level.mapWidth ?? GAME_WIDTH;
  const push = (severity: 'error' | 'warning', message: string) =>
    issues.push({ severity, pack: packId, level: level.id, levelName: level.name, message });

  // Goal presence
  const goals = level.objects.filter(o => o.type === 'goal');
  if (goals.length === 0) push('error', 'no goal object');
  if (goals.length > 1) push('warning', `${goals.length} goal objects — only the first will count`);

  // Duplicate IDs
  const seenIds = new Set<string>();
  for (const o of level.objects) {
    if (seenIds.has(o.id)) push('error', `duplicate object id "${o.id}"`);
    seenIds.add(o.id);
  }

  // LinkedId resolves
  const byId = new Map(level.objects.map(o => [o.id, o]));
  for (const o of level.objects) {
    if (o.linkedId && !byId.has(o.linkedId)) {
      push('error', `"${o.id}" links to missing object "${o.linkedId}"`);
    }
  }

  // Spawn bounds
  for (const [i, sp] of level.spawnPoints.entries()) {
    if (sp.x < 0 || sp.x > mapW) {
      push('warning', `spawn[${i}] x=${sp.x} outside mapWidth=${mapW}`);
    }
  }

  // Pressure-only AND-group solvability
  const buttonsPerDoor = new Map<string, LevelObjectDef[]>();
  for (const o of level.objects) {
    if (o.type !== 'button' || !o.linkedId) continue;
    const target = byId.get(o.linkedId);
    if (target?.type !== 'door') continue; // buttons linked to traps have different semantics
    const arr = buttonsPerDoor.get(o.linkedId) ?? [];
    arr.push(o);
    buttonsPerDoor.set(o.linkedId, arr);
  }
  for (const [doorId, buttons] of buttonsPerDoor) {
    const allPressure = buttons.every(b => !b.latching);
    if (!allPressure) continue;
    const holdersNeeded = buttons.reduce((s, b) => s + b.requiredPlayers, 0);
    if (holdersNeeded >= effectiveMinPlayers) {
      push(
        'error',
        `door "${doorId}" needs ${holdersNeeded} simultaneous pressure holders but ` +
        `minPlayers=${effectiveMinPlayers} — nobody free to cross. Latch at least one ` +
        `linked button or reduce requiredPlayers.`,
      );
    }
  }

  // Orphan-door check
  for (const o of level.objects) {
    if (o.type !== 'door') continue;
    if (!buttonsPerDoor.has(o.id)) {
      push(
        'error',
        `door "${o.id}" has no button linking to it — it stays closed forever. ` +
        `Add a button with linkedId="${o.id}" or remove the door.`,
      );
    }
  }

  // ── Spatial safety: buttons/goals/springs must not overlap lava traps ────────
  // A button sitting on lava is unreachable without dying.
  const traps = level.objects.filter(o => o.type === 'trap');
  const interactable = level.objects.filter(
    o => o.type === 'button' || o.type === 'goal' || o.type === 'spring',
  );
  // Floor level: button/goal/spring must be at roughly PLAYER_ON_FLOOR y
  // (elevated objects on platforms are safe above floor-level lava).
  const FLOOR_Y_APPROX = FLOOR_TOP - TILE_SIZE / 2; // ~672
  for (const obj of interactable) {
    // Only check objects that are at floor level (y within 48 px of PLAYER_ON_FLOOR).
    // Elevated platform buttons are safely above floor-level lava.
    if (Math.abs(obj.y - FLOOR_Y_APPROX) > TILE_SIZE * 1.5) continue;
    const oL = obj.x - obj.width  / 2;
    const oR = obj.x + obj.width  / 2;
    for (const trap of traps) {
      // Skip traps that ARE this button's linked target (lava deactivated when btn held)
      const linkedToThisBtn = obj.type === 'button' && obj.linkedId === trap.id;
      // Skip traps linked to a latching button that permanently deactivates them
      const linkedLatch = level.objects.find(
        b => b.type === 'button' && b.linkedId === trap.id && b.latching,
      );
      if (linkedToThisBtn || linkedLatch) continue;
      const tL = trap.x - trap.width  / 2;
      const tR = trap.x + trap.width  / 2;
      if (oR > tL && oL < tR) {
        push(
          'error',
          `${obj.type} "${obj.id}" (x=${obj.x}) overlaps lava trap "${trap.id}" ` +
          `(x=${trap.x} w=${trap.width}) — unreachable without dying.`,
        );
      }
    }
  }

  return issues;
}

/** Run `validateLevel` over every level in the pack. */
export function validatePack(pack: LevelPack): ValidationIssue[] {
  return pack.levels.flatMap(l =>
    validateLevel(l, Math.max(pack.minPlayers, l.minPlayers), pack.id),
  );
}

/**
 * Pretty-print + return validation issues for multiple packs. Intended for
 * server startup: errors block launch, warnings are logged but allow boot.
 * Returns the issue list so callers can decide their own policy.
 */
export function validateAllPacks(packs: LevelPack[]): ValidationIssue[] {
  const issues = packs.flatMap(validatePack);
  if (issues.length === 0) {
    console.log('[level-validator] all packs passed validation');
    return issues;
  }
  for (const issue of issues) {
    const tag = issue.severity === 'error' ? 'ERROR' : 'warn ';
    console.warn(
      `[level-validator] ${tag} pack=${issue.pack} L${issue.level} "${issue.levelName}": ${issue.message}`,
    );
  }
  return issues;
}
