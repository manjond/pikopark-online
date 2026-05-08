/**
 * Level construction helpers plus static validation.
 *
 * The game is server-authoritative, so these helpers keep authored levels
 * close to the real physics constants and catch common "looks fine, cannot
 * be completed" mistakes before the server boots.
 */

import {
  GAME_HEIGHT,
  GAME_WIDTH,
  GRAVITY,
  JUMP_VELOCITY,
  MAX_PLAYERS,
  MOVE_SPEED,
  SPRING_VELOCITY,
  TILE_SIZE,
} from '../constants';
import type {
  LevelData,
  LevelObjectDef,
  LevelPack,
  PlatformMotion,
  SolidRect,
  SpawnPoint,
} from '../level';

// Core Y-coordinates.
export const FLOOR_TOP = GAME_HEIGHT - TILE_SIZE;
export const PLAYER_ON_FLOOR = FLOOR_TOP - TILE_SIZE / 2;

// Reachability physics. Values are derived from the runtime constants.
const JUMP_RISE = (JUMP_VELOCITY * JUMP_VELOCITY) / (2 * GRAVITY);
const SPRING_RISE = (SPRING_VELOCITY * SPRING_VELOCITY) / (2 * GRAVITY);

export const SOLO_FEET_PEAK = Math.round(PLAYER_ON_FLOOR + TILE_SIZE / 2 - JUMP_RISE);
export const STACK2_FEET_PEAK = Math.round(PLAYER_ON_FLOOR - TILE_SIZE + TILE_SIZE / 2 - JUMP_RISE);
export const STACK3_FEET_PEAK = Math.round(PLAYER_ON_FLOOR - 2 * TILE_SIZE + TILE_SIZE / 2 - JUMP_RISE);
export const SPRING_FEET_PEAK = Math.round((FLOOR_TOP - TILE_SIZE) + TILE_SIZE / 2 - SPRING_RISE);

const THROW_VY_MAGNITUDE = Math.abs(JUMP_VELOCITY) * 1.15;
const THROW_RISE = (THROW_VY_MAGNITUDE * THROW_VY_MAGNITUDE) / (2 * GRAVITY);
export const THROW_FEET_PEAK = Math.round((PLAYER_ON_FLOOR - TILE_SIZE) + TILE_SIZE / 2 - THROW_RISE);
export const THROW_HORIZONTAL_MAX = Math.round(MOVE_SPEED * 1.3 * (2 * THROW_VY_MAGNITUDE) / GRAVITY);

// Solid-rect factories.
export function groundRect(mapWidth: number = GAME_WIDTH): SolidRect {
  return { x: 0, y: FLOOR_TOP, width: mapWidth, height: TILE_SIZE, tileType: 'ground' };
}

export function groundSegment(x: number, width: number): SolidRect {
  return { x, y: FLOOR_TOP, width, height: TILE_SIZE, tileType: 'ground' };
}

export function platformRect(x: number, yTop: number, width: number): SolidRect {
  return { x, y: yTop, width, height: TILE_SIZE, tileType: 'platform' };
}

export function icePlatform(x: number, yTop: number, width: number): SolidRect {
  return { x, y: yTop, width, height: TILE_SIZE, tileType: 'ice' };
}

export function standardSpawns(
  count: number = MAX_PLAYERS,
  startX: number = 48,
  gap: number = 64,
): SpawnPoint[] {
  return Array.from({ length: count }, (_, i) => ({
    x: startX + i * gap,
    y: PLAYER_ON_FLOOR,
  }));
}

// Interactive-object factories.
export interface ButtonOpts {
  latching?: boolean;
  requiredPlayers?: number;
  width?: number;
  yOffset?: number;
}

function buttonWithLatching(base: LevelObjectDef, opts?: ButtonOpts): LevelObjectDef {
  if (opts?.latching) base.latching = true;
  return base;
}

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

export function floorTrap(
  id: string,
  x: number,
  width: number = 96,
  linkedId: string = '',
): LevelObjectDef {
  const lavaHeight = 16;
  return {
    id,
    type: 'trap',
    x,
    y: FLOOR_TOP + lavaHeight / 2 - 4,
    width,
    height: lavaHeight,
    requiredPlayers: 0,
    linkedId,
  };
}

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
    y: FLOOR_TOP - 8,
    width,
    height: 16,
    requiredPlayers: 0,
    linkedId: '',
  };
  if (power !== undefined) obj.power = power;
  return obj;
}

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
    width: TILE_SIZE,
    height: TILE_SIZE,
    requiredPlayers: 0,
    linkedId: '',
    segments: Math.max(1, Math.min(8, Math.floor(segments))),
    angleDeg: startAngleDeg,
    power: speedRadPerSec,
  };
}

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

export function vine(
  id: string,
  x: number,
  y: number,
  height: number = 160,
  speed: number = 560,
  power: number = -720,
): LevelObjectDef {
  return {
    id,
    type: 'vine',
    x,
    y,
    width: 48,
    height,
    requiredPlayers: 0,
    linkedId: '',
    speed,
    power,
  };
}

export function spikeTrap(
  id: string,
  x: number,
  yTop: number = FLOOR_TOP - 16,
  width: number = 96,
): LevelObjectDef {
  return {
    id,
    type: 'spike',
    x,
    y: yTop + 8,
    width,
    height: 16,
    requiredPlayers: 0,
    linkedId: '',
  };
}

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

// Validation.
export interface ValidationIssue {
  severity: 'error' | 'warning';
  pack: string;
  level: number;
  levelName: string;
  message: string;
}

interface Surface {
  id: string;
  x1: number;
  x2: number;
  y: number;
  source: string;
}

const SUPPORTED_PACK_MIN_PLAYERS = new Set([1, 2, 4]);
const SURFACE_EPSILON = 2;
const REACH_MARGIN = 8;

function issueFor(
  issues: ValidationIssue[],
  level: LevelData,
  packId: string,
  severity: 'error' | 'warning',
  message: string,
): void {
  issues.push({ severity, pack: packId, level: level.id, levelName: level.name, message });
}

function rangesOverlap(a1: number, a2: number, b1: number, b2: number): boolean {
  return a2 > b1 && a1 < b2;
}

function rangeContains(container1: number, container2: number, inner1: number, inner2: number): boolean {
  return container1 <= inner1 + SURFACE_EPSILON && container2 >= inner2 - SURFACE_EPSILON;
}

function horizontalGap(a: Surface, b: Surface): number {
  if (a.x2 < b.x1) return b.x1 - a.x2;
  if (b.x2 < a.x1) return a.x1 - b.x2;
  return 0;
}

function objectLeft(o: LevelObjectDef): number {
  return o.x - o.width / 2;
}

function objectRight(o: LevelObjectDef): number {
  return o.x + o.width / 2;
}

function objectStandY(o: LevelObjectDef): number {
  if (o.type === 'button' || o.type === 'goal') return o.y + TILE_SIZE / 2;
  return o.y + o.height / 2;
}

function buildSurfaces(level: LevelData): Surface[] {
  const surfaces: Surface[] = level.solidRects.map((r, i) => ({
    id: `solid:${i}`,
    x1: r.x,
    x2: r.x + r.width,
    y: r.y,
    source: r.tileType,
  }));

  level.objects.forEach((o, i) => {
    if (o.type !== 'platform' && o.type !== 'crumble') return;

    let x1 = o.x - o.width / 2;
    let x2 = o.x + o.width / 2;
    let y = o.y - o.height / 2;

    if (o.type === 'platform' && o.motion) {
      if (o.motion.axis === 'x') {
        x1 = Math.min(o.motion.from, o.motion.to) - o.width / 2;
        x2 = Math.max(o.motion.from, o.motion.to) + o.width / 2;
      } else {
        y = Math.min(o.motion.from, o.motion.to) - o.height / 2;
      }
    }

    surfaces.push({ id: `${o.type}:${i}:${o.id}`, x1, x2, y, source: o.type });
  });

  return surfaces;
}

function findSurfaceForSpan(
  surfaces: Surface[],
  x1: number,
  x2: number,
  standY: number,
  tolerance: number = TILE_SIZE * 0.75,
): Surface | null {
  const candidates = surfaces
    .filter(s => rangesOverlap(x1, x2, s.x1, s.x2) && Math.abs(s.y - standY) <= tolerance)
    .sort((a, b) => Math.abs(a.y - standY) - Math.abs(b.y - standY));
  return candidates[0] ?? null;
}

function findSurfaceForObject(surfaces: Surface[], o: LevelObjectDef): Surface | null {
  const inset = Math.min(4, o.width / 4);
  return findSurfaceForSpan(surfaces, objectLeft(o) + inset, objectRight(o) - inset, objectStandY(o));
}

function findSurfaceForSpawn(surfaces: Surface[], spawn: SpawnPoint): Surface | null {
  return findSurfaceForSpan(
    surfaces,
    spawn.x - TILE_SIZE / 2 + 4,
    spawn.x + TILE_SIZE / 2 - 4,
    spawn.y + TILE_SIZE / 2,
    TILE_SIZE * 0.5,
  );
}

function assistedJumpRise(players: number): number {
  return JUMP_RISE + TILE_SIZE * Math.max(0, Math.min(players, 4) - 1);
}

function canJumpBetween(a: Surface, b: Surface, players: number, allowThrow: boolean): boolean {
  if (a.id === b.id) return true;

  const rise = a.y - b.y;
  const gap = horizontalGap(a, b);
  const dropBonus = Math.max(0, b.y - a.y) * 0.55;
  const normalRise = assistedJumpRise(players) - REACH_MARGIN;

  if (rise <= normalRise) {
    const stacked = players > 1 && rise > JUMP_RISE - REACH_MARGIN;
    const range = stacked ? 210 : 310 + dropBonus;
    return gap <= range;
  }

  if (!allowThrow || players < 2) return false;
  const throwRise = THROW_RISE + TILE_SIZE - REACH_MARGIN;
  if (rise > throwRise) return false;
  return gap <= THROW_HORIZONTAL_MAX * 0.85;
}

function canSpringTo(spring: LevelObjectDef, target: Surface, from: Surface): boolean {
  const rise = from.y - target.y;
  if (rise > SPRING_RISE - REACH_MARGIN) return false;
  const gap =
    spring.x < target.x1 ? target.x1 - spring.x :
    spring.x > target.x2 ? spring.x - target.x2 :
    0;
  const dropBonus = Math.max(0, target.y - from.y) * 0.35;
  return gap <= 430 + dropBonus;
}

function canReachVine(from: Surface, vineObj: LevelObjectDef, players: number): boolean {
  const vineBottom = vineObj.y + vineObj.height / 2;
  const rise = from.y - vineBottom;
  if (rise > assistedJumpRise(players) - REACH_MARGIN) return false;
  const gap =
    vineObj.x < from.x1 ? from.x1 - vineObj.x :
    vineObj.x > from.x2 ? vineObj.x - from.x2 :
    0;
  return gap <= 300;
}

function canVineTo(vineObj: LevelObjectDef, target: Surface): boolean {
  const dir = (vineObj.speed ?? 560) < 0 ? -1 : 1;
  if (dir > 0 && target.x2 < vineObj.x) return false;
  if (dir < 0 && target.x1 > vineObj.x) return false;

  const launchRise = Math.abs(vineObj.power ?? -720);
  const rise = vineObj.y - target.y;
  if (rise > (launchRise * launchRise) / (2 * GRAVITY) + TILE_SIZE - REACH_MARGIN) {
    return false;
  }

  const gap =
    dir > 0
      ? Math.max(0, target.x1 - vineObj.x)
      : Math.max(0, vineObj.x - target.x2);
  return gap <= Math.abs(vineObj.speed ?? 560) * 0.9;
}

function reachableSurfaceIds(
  level: LevelData,
  surfaces: Surface[],
  startIds: string[],
  players: number,
  allowThrow: boolean,
): Set<string> {
  const byId = new Map(surfaces.map(s => [s.id, s]));
  const reachable = new Set<string>();
  const queue: Surface[] = [];

  for (const id of startIds) {
    const surface = byId.get(id);
    if (!surface || reachable.has(id)) continue;
    reachable.add(id);
    queue.push(surface);
  }

  const springs = level.objects
    .filter(o => o.type === 'spring')
    .map(o => ({ obj: o, surface: findSurfaceForObject(surfaces, o) }))
    .filter((entry): entry is { obj: LevelObjectDef; surface: Surface } => entry.surface !== null);
  const vines = level.objects.filter(o => o.type === 'vine');

  while (queue.length > 0) {
    const current = queue.shift()!;

    for (const target of surfaces) {
      if (reachable.has(target.id)) continue;
      if (!canJumpBetween(current, target, players, allowThrow)) continue;
      reachable.add(target.id);
      queue.push(target);
    }

    for (const spring of springs) {
      if (spring.surface.id !== current.id) continue;
      for (const target of surfaces) {
        if (reachable.has(target.id)) continue;
        if (!canSpringTo(spring.obj, target, current)) continue;
        reachable.add(target.id);
        queue.push(target);
      }
    }

    for (const vineObj of vines) {
      if (!canReachVine(current, vineObj, players)) continue;
      for (const target of surfaces) {
        if (reachable.has(target.id)) continue;
        if (!canVineTo(vineObj, target)) continue;
        reachable.add(target.id);
        queue.push(target);
      }
    }
  }

  return reachable;
}

function sameSurfacePathClear(
  level: LevelData,
  surfaces: Surface[],
  box: LevelObjectDef,
  button: LevelObjectDef,
): boolean {
  const boxSurface = findSurfaceForObject(surfaces, box);
  const buttonSurface = findSurfaceForObject(surfaces, button);
  if (!boxSurface || !buttonSurface || boxSurface.id !== buttonSurface.id) return false;

  const pathLeft = Math.min(objectLeft(box), objectLeft(button));
  const pathRight = Math.max(objectRight(box), objectRight(button));
  if (!rangeContains(boxSurface.x1, boxSurface.x2, pathLeft, pathRight)) return false;

  for (const trap of level.objects) {
    if (trap.type !== 'trap' && trap.type !== 'spike') continue;
    if (!rangesOverlap(pathLeft, pathRight, objectLeft(trap), objectRight(trap))) continue;
    if (Math.abs(objectStandY(trap) - boxSurface.y) <= TILE_SIZE) return false;
  }

  for (const door of level.objects) {
    if (door.type !== 'door') continue;
    if (door.x > pathLeft && door.x < pathRight) return false;
  }

  return true;
}

function hasSurfaceUnderObject(surfaces: Surface[], object: LevelObjectDef): boolean {
  const left = objectLeft(object);
  const right = objectRight(object);
  const bottom = object.y + object.height / 2;
  return surfaces.some(s =>
    Math.abs(s.y - bottom) <= TILE_SIZE * 0.75 &&
    rangeContains(s.x1, s.x2, left, right),
  );
}

function hasGroundUnderTrap(surfaces: Surface[], trap: LevelObjectDef): boolean {
  const left = objectLeft(trap);
  const right = objectRight(trap);
  return surfaces.some(s =>
    s.source === 'ground' &&
    Math.abs(s.y - FLOOR_TOP) <= SURFACE_EPSILON &&
    rangeContains(s.x1, s.x2, left, right),
  );
}

function overlapsFloorTrap(obj: LevelObjectDef, trap: LevelObjectDef): boolean {
  if (!rangesOverlap(objectLeft(obj), objectRight(obj), objectLeft(trap), objectRight(trap))) return false;
  return Math.abs(objectStandY(obj) - FLOOR_TOP) <= TILE_SIZE * 1.5;
}

export function validateLevel(
  level: LevelData,
  effectiveMinPlayers: number,
  packId: string = '',
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const mapWidth = level.mapWidth ?? GAME_WIDTH;
  const push = (severity: 'error' | 'warning', message: string) =>
    issueFor(issues, level, packId, severity, message);

  if (level.minPlayers > effectiveMinPlayers) {
    push('warning', `level minPlayers=${level.minPlayers} is higher than effectiveMinPlayers=${effectiveMinPlayers}`);
  }

  const goals = level.objects.filter(o => o.type === 'goal');
  if (goals.length !== 1) push('error', `expected exactly one goal, found ${goals.length}`);

  const seenIds = new Set<string>();
  const objectById = new Map<string, LevelObjectDef>();
  for (const object of level.objects) {
    if (seenIds.has(object.id)) push('error', `duplicate object id "${object.id}"`);
    seenIds.add(object.id);
    objectById.set(object.id, object);

    if (object.requiredPlayers > effectiveMinPlayers) {
      push(
        'error',
        `"${object.id}" requires ${object.requiredPlayers} players but pack starts with ${effectiveMinPlayers}`,
      );
    }
  }

  for (const object of level.objects) {
    if (object.linkedId && !objectById.has(object.linkedId)) {
      push('error', `"${object.id}" links to missing object "${object.linkedId}"`);
    }
  }

  if (level.spawnPoints.length < effectiveMinPlayers) {
    push('error', `only ${level.spawnPoints.length} spawn points for ${effectiveMinPlayers}+ pack`);
  } else if (level.spawnPoints.length < MAX_PLAYERS) {
    push('warning', `only ${level.spawnPoints.length} spawn points; ${MAX_PLAYERS}-player rooms will use fallback spawns`);
  }

  for (const [i, spawn] of level.spawnPoints.entries()) {
    if (spawn.x < TILE_SIZE / 2 || spawn.x > mapWidth - TILE_SIZE / 2) {
      push('error', `spawn[${i}] x=${spawn.x} is outside map bounds 0..${mapWidth}`);
    }
  }

  for (const rect of level.solidRects) {
    if (rect.x < 0 || rect.x + rect.width > mapWidth) {
      push('warning', `solid rect x=[${rect.x},${rect.x + rect.width}] exceeds mapWidth=${mapWidth}`);
    }
  }

  const surfaces = buildSurfaces(level);
  const startSurfaces = level.spawnPoints
    .slice(0, Math.max(effectiveMinPlayers, 1))
    .map((spawn, index) => {
      const surface = findSurfaceForSpawn(surfaces, spawn);
      if (!surface) push('error', `spawn[${index}] is not standing on any solid surface`);
      return surface;
    })
    .filter((surface): surface is Surface => surface !== null);

  const allStartIds = Array.from(new Set(startSurfaces.map(s => s.id)));
  const assistedReachable = reachableSurfaceIds(level, surfaces, allStartIds, effectiveMinPlayers, false);

  if (goals.length === 1) {
    const goalSurface = findSurfaceForObject(surfaces, goals[0]);
    if (!goalSurface) {
      push('error', `goal "${goals[0].id}" is not standing on a reachable surface`);
    } else {
      for (const [i, spawnSurface] of startSurfaces.entries()) {
        const soloReachable = reachableSurfaceIds(level, surfaces, [spawnSurface.id], 1, false);
        if (!soloReachable.has(goalSurface.id)) {
          push('error', `goal is not reachable by player ${i + 1} using solo movement after gates are open`);
        }
      }
    }
  }

  for (const surface of surfaces) {
    if (surface.source === 'ground') continue;
    if (!assistedReachable.has(surface.id)) {
      push('warning', `surface ${surface.id} is not reachable with ${effectiveMinPlayers} player(s)`);
    }
  }

  const buttons = level.objects.filter(o => o.type === 'button');
  const doors = level.objects.filter(o => o.type === 'door');
  const boxes = level.objects.filter(o => o.type === 'box');
  const traps = level.objects.filter(o => o.type === 'trap' || o.type === 'spike');

  for (const button of buttons) {
    const surface = findSurfaceForObject(surfaces, button);
    if (!surface) {
      push('error', `button "${button.id}" is not standing on any surface`);
    } else if (!assistedReachable.has(surface.id)) {
      push('error', `button "${button.id}" is not reachable with ${effectiveMinPlayers} player(s)`);
    }
  }

  for (const spring of level.objects.filter(o => o.type === 'spring')) {
    const surface = findSurfaceForObject(surfaces, spring);
    if (!surface) push('error', `spring "${spring.id}" is not standing on any surface`);
  }

  for (const box of boxes) {
    const surface = findSurfaceForObject(surfaces, box);
    if (!surface) push('error', `box "${box.id}" is not standing on any surface`);
  }

  for (const vineObj of level.objects.filter(o => o.type === 'vine')) {
    if (vineObj.x - vineObj.width / 2 < 0 || vineObj.x + vineObj.width / 2 > mapWidth) {
      push('error', `vine "${vineObj.id}" is outside map bounds`);
    }
    const usableFromReachableSurface = surfaces.some(surface =>
      assistedReachable.has(surface.id) && canReachVine(surface, vineObj, effectiveMinPlayers),
    );
    const launchesToSurface = surfaces.some(surface => canVineTo(vineObj, surface));
    if (!usableFromReachableSurface || !launchesToSurface) {
      push('warning', `vine "${vineObj.id}" does not connect two validated reachable surfaces`);
    }
  }

  for (const trap of traps) {
    const supported = trap.type === 'trap'
      ? hasGroundUnderTrap(surfaces, trap)
      : hasSurfaceUnderObject(surfaces, trap);
    if (!supported) {
      push('error', `${trap.type} "${trap.id}" is not fully supported by a surface`);
    }
    for (const object of level.objects) {
      if (object === trap) continue;
      if (object.type !== 'button' && object.type !== 'goal' && object.type !== 'spring' && object.type !== 'box') {
        continue;
      }
      if (overlapsFloorTrap(object, trap)) {
        push('error', `${object.type} "${object.id}" overlaps ${trap.type} "${trap.id}"`);
      }
    }
  }

  for (const door of doors) {
    const linkedButtons = buttons.filter(button => button.linkedId === door.id);
    if (linkedButtons.length === 0) {
      push('error', `door "${door.id}" has no linked button`);
      continue;
    }

    for (const button of linkedButtons) {
      if (button.x > door.x - TILE_SIZE) {
        push('error', `button "${button.id}" is behind or inside its linked door "${door.id}"`);
      }
    }

    const pressureButtons = linkedButtons.filter(button => !button.latching);
    if (pressureButtons.length > 0) {
      const candidateBoxes = boxes.filter(box => box.x < door.x - TILE_SIZE);
      if (candidateBoxes.length < pressureButtons.length) {
        push(
          'error',
          `door "${door.id}" has ${pressureButtons.length} pressure button(s) but only ${candidateBoxes.length} box(es) before it`,
        );
      }

      for (const button of pressureButtons) {
        const boxCanHold = candidateBoxes.some(box => sameSurfacePathClear(level, surfaces, box, button));
        if (!boxCanHold) {
          push('error', `pressure button "${button.id}" has no box with a continuous safe path to hold it`);
        }
      }
    }
  }

  const goal = goals[0];
  if (goal) {
    for (const door of doors) {
      if (door.x > goal.x) {
        push('warning', `door "${door.id}" is placed after the goal`);
      }
    }
  }

  return issues;
}

export function validatePack(pack: LevelPack): ValidationIssue[] {
  const issues = pack.levels.flatMap(level =>
    validateLevel(level, Math.max(pack.minPlayers, level.minPlayers), pack.id),
  );

  const pushPackIssue = (severity: 'error' | 'warning', message: string) => {
    issues.push({ severity, pack: pack.id, level: 0, levelName: pack.name, message });
  };

  if (!SUPPORTED_PACK_MIN_PLAYERS.has(pack.minPlayers)) {
    pushPackIssue('error', `unsupported pack minPlayers=${pack.minPlayers}; expected 1, 2, or 4`);
  }
  if (pack.levels.length !== 5) {
    pushPackIssue('error', `pack must contain exactly 5 levels, found ${pack.levels.length}`);
  }

  return issues;
}

export function validateAllPacks(packs: LevelPack[]): ValidationIssue[] {
  const issues = packs.flatMap(validatePack);
  const pushCatalogIssue = (severity: 'error' | 'warning', message: string) => {
    issues.push({ severity, pack: 'catalog', level: 0, levelName: 'catalog', message });
  };

  const packIds = new Set<string>();
  for (const pack of packs) {
    if (packIds.has(pack.id)) pushCatalogIssue('error', `duplicate pack id "${pack.id}"`);
    packIds.add(pack.id);
  }

  for (const minPlayers of [1, 2, 4]) {
    const count = packs.filter(pack => pack.minPlayers === minPlayers).length;
    if (count !== 3) pushCatalogIssue('error', `expected exactly three ${minPlayers}+ packs, found ${count}`);
  }

  const levelIds = new Map<number, string>();
  for (const pack of packs) {
    for (const level of pack.levels) {
      const owner = levelIds.get(level.id);
      if (owner) pushCatalogIssue('error', `level id ${level.id} appears in both ${owner} and ${pack.id}`);
      levelIds.set(level.id, pack.id);
    }
  }

  if (issues.length === 0) {
    console.log('[level-validator] all packs passed validation');
    return issues;
  }

  for (const issue of issues) {
    const tag = issue.severity === 'error' ? 'ERROR' : 'warn ';
    console.warn(`[level-validator] ${tag} pack=${issue.pack} L${issue.level} "${issue.levelName}": ${issue.message}`);
  }

  return issues;
}
