// Shadow Shift: Night Vault - core stealth engine.
// Geometry, guard AI, detection and collision. Pure logic, no drawing:
// render.js paints whatever this module computes, which keeps the vision
// cones honest - a cone is drawn from the same ray casts that decide
// whether the player is seen.

import { LEVELS, FIELD_W, FIELD_H } from './levels.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_CAUGHT = 'caught';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_WIN = 'win';

const PLAYER_R = 13;
const GUARD_R = 14;

export function rectsBlockSegment(x1, y1, x2, y2, blocks) {
  // Segment vs each rect: sample-free slab test per rectangle.
  for (const b of blocks) {
    if (segmentHitsRect(x1, y1, x2, y2, b)) return true;
  }
  return false;
}

function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1, dy = y2 - y1;
  let t0 = 0, t1 = 1;
  // Clip against the four slabs; a hit inside (0.001, 0.999) means the
  // sight line passes through the rect's interior before its endpoint.
  const slabs = [
    [-dx, x1 - r.x], [dx, (r.x + r.w) - x1],
    [-dy, y1 - r.y], [dy, (r.y + r.h) - y1],
  ];
  for (const [p, q] of slabs) {
    if (Math.abs(p) < 1e-9) { if (q < 0) return false; continue; }
    const t = q / p;
    if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
    else { if (t < t0) return false; if (t < t1) t1 = t; }
  }
  return t0 < 0.999 && t1 > 0.001 && t0 <= t1;
}

export function rayDistance(x, y, angle, maxDist, blocks) {
  // March in small steps; cheap and accurate enough at this scale, and it
  // uses the exact same blocker test as detection.
  const step = 6;
  let d = step;
  while (d < maxDist) {
    const px = x + Math.cos(angle) * d, py = y + Math.sin(angle) * d;
    for (const b of blocks) {
      if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) return d - step * 0.5;
    }
    d += step;
  }
  return maxDist;
}

function circleHitsBlocks(x, y, rad, blocks) {
  for (const b of blocks) {
    const cx = Math.max(b.x, Math.min(x, b.x + b.w));
    const cy = Math.max(b.y, Math.min(y, b.y + b.h));
    const dx = x - cx, dy = y - cy;
    if (dx * dx + dy * dy < rad * rad) return true;
  }
  return false;
}

export function moveCircle(pos, dx, dy, rad, blocks) {
  // Axis-separated movement so the player slides along walls and crates.
  const nx = pos.x + dx;
  if (!circleHitsBlocks(nx, pos.y, rad, blocks)) pos.x = nx;
  const ny = pos.y + dy;
  if (!circleHitsBlocks(pos.x, ny, rad, blocks)) pos.y = ny;
  pos.x = Math.max(rad, Math.min(FIELD_W - rad, pos.x));
  pos.y = Math.max(rad, Math.min(FIELD_H - rad, pos.y));
}

class Guard {
  constructor(def, blocks) {
    this.def = def;
    this.blocks = blocks;
    this.x = def.path[0][0];
    this.y = def.path[0][1];
    this.target = 1 % def.path.length;
    this.wait = 0;
    this.angle = Math.atan2(def.path[this.target][1] - this.y, def.path[this.target][0] - this.x);
    this.scanPhase = Math.random() * 6.28;
    this.alert = 0; // 0 calm, 1 suspicious pause
  }
  update(dt, playerSeen) {
    this.scanPhase += dt;
    if (this.wait > 0) {
      this.wait -= dt;
      if (playerSeen) return; // staring at the intruder beats scanning
      if (this.def.scan) {
        const base = this.baseAngle ?? this.angle;
        this.angle = base + Math.sin(this.scanPhase * 1.7) * 0.85;
      }
      return;
    }
    if (playerSeen) return; // freezes while staring the player down
    const [tx, ty, waitS] = this.def.path[this.target];
    const dx = tx - this.x, dy = ty - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 4) {
      this.x = tx; this.y = ty;
      this.baseAngle = this.angle;
      this.wait = waitS;
      this.target = (this.target + 1) % this.def.path.length;
      return;
    }
    const vx = (dx / dist) * this.def.speed * dt;
    const vy = (dy / dist) * this.def.speed * dt;
    const before = { x: this.x, y: this.y };
    moveCircle(before, vx, vy, GUARD_R, this.blocks);
    this.x = before.x; this.y = before.y;
    const want = Math.atan2(dy, dx);
    let diff = want - this.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.angle += diff * Math.min(1, dt * 7);
  }
  sees(px, py, sneaking) {
    const dx = px - this.x, dy = py - this.y;
    const dist = Math.hypot(dx, dy);
    const range = sneaking ? this.def.range * 0.82 : this.def.range;
    if (dist > range) return 0;
    let diff = Math.atan2(dy, dx) - this.angle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    if (Math.abs(diff) > this.def.fov) return 0;
    if (rectsBlockSegment(this.x, this.y, px, py, this.blocks)) return 0;
    // Closer and more central = spotted faster.
    const closeness = 1 - dist / range;
    const centred = 1 - Math.abs(diff) / this.def.fov;
    return 0.35 + closeness * 0.9 + centred * 0.45;
  }
}

export class Game {
  constructor() {
    this.screen = SCREEN_TITLE;
    this.levelIndex = 0;
    this.time = 0;
    this.totalTime = 0;
    this.caughtCount = 0;
    this.detection = 0;
    this.message = '';
    this.flash = 0;
    this.keys = new Set();
    this.loadLevel(0);
  }
  loadLevel(index) {
    this.levelIndex = index;
    const level = LEVELS[index];
    this.level = level;
    this.player = { x: level.start.x, y: level.start.y };
    this.guards = level.guards.map((g) => new Guard(g, level.blocks));
    this.detection = 0;
    this.seenBy = 0;
  }
  startGame() {
    this.totalTime = 0;
    this.time = 0;
    this.caughtCount = 0;
    this.loadLevel(0);
    this.screen = SCREEN_PLAY;
    this.message = this.level.hint;
  }
  update(dt) {
    this.time += dt;
    if (this.screen === SCREEN_PLAY) this.totalTime += dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.screen !== SCREEN_PLAY) return;

    const sneaking = this.keys.has('shift');
    const speed = sneaking ? 92 : 168;
    let dx = 0, dy = 0;
    if (this.keys.has('left')) dx -= 1;
    if (this.keys.has('right')) dx += 1;
    if (this.keys.has('up')) dy -= 1;
    if (this.keys.has('down')) dy += 1;
    if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
    if (dx || dy) moveCircle(this.player, dx * speed * dt, dy * speed * dt, PLAYER_R, this.level.blocks);
    this.sneaking = sneaking;

    let strongest = 0;
    for (const guard of this.guards) {
      const s = guard.sees(this.player.x, this.player.y, sneaking);
      if (s > strongest) strongest = s;
    }
    this.seenBy = strongest;
    for (const guard of this.guards) guard.update(dt, strongest > 0 && guard.sees(this.player.x, this.player.y, sneaking) > 0);

    if (strongest > 0) {
      this.detection += strongest * dt * (sneaking ? 0.72 : 1);
      if (this.detection > 0.35 && this.detection < 1) this.message = 'Spotted! Break line of sight - get behind cover!';
    } else {
      this.detection = Math.max(0, this.detection - dt * 0.55);
      if (this.detection <= 0.35 && this.message.startsWith('Spotted')) this.message = this.level.hint;
    }
    if (this.detection >= 1) {
      this.screen = SCREEN_CAUGHT;
      this.caughtCount += 1;
      this.flash = 0.6;
      this.message = 'Caught! The vault resets this room.';
      return;
    }
    const e = this.level.exit;
    if (this.player.x > e.x && this.player.x < e.x + e.w && this.player.y > e.y && this.player.y < e.y + e.h) {
      if (this.levelIndex + 1 >= LEVELS.length) {
        this.screen = SCREEN_WIN;
        this.message = 'The Night Vault is yours - never seen, never heard.';
      } else {
        this.screen = SCREEN_CLEAR;
        this.message = 'Room cleared, unseen. Press Enter for the next vault.';
      }
    }
  }
  confirm() {
    if (this.screen === SCREEN_TITLE) this.startGame();
    else if (this.screen === SCREEN_CAUGHT) { this.loadLevel(this.levelIndex); this.screen = SCREEN_PLAY; }
    else if (this.screen === SCREEN_CLEAR) { this.loadLevel(this.levelIndex + 1); this.screen = SCREEN_PLAY; this.message = this.level.hint; }
    else if (this.screen === SCREEN_WIN) this.screen = SCREEN_TITLE;
  }
}
