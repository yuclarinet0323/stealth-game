// Shadow Shift: Night Vault - level layouts.
// The play field is 960 x 560 (below a 56 px HUD bar). Every wall and crate
// is an axis-aligned rectangle that blocks movement AND guard sight, so
// hiding behind cover genuinely breaks line of sight.
// Guard waypoints: [x, y, waitSeconds] - a guard walks to each point in
// order, pauses, and (when scan is true) sweeps its cone while pausing.

export const FIELD_W = 960;
export const FIELD_H = 560;
export const HUD_H = 56;

function wall(x, y, w, h) { return { x, y, w, h, kind: 'wall' }; }
function crate(x, y, w, h) { return { x, y, w, h, kind: 'crate' }; }

export const LEVELS = [
  {
    name: 'Vault 1 - Outer Gallery',
    hint: 'Cross the gallery. Hold Shift to sneak: you are spotted more slowly.',
    start: { x: 56, y: 500 },
    exit: { x: 872, y: 36, w: 56, h: 56 },
    blocks: [
      wall(0, 0, 960, 12), wall(0, 548, 960, 12), wall(0, 0, 12, 560), wall(948, 0, 12, 560),
      wall(180, 90, 16, 220), wall(420, 250, 16, 220), wall(660, 90, 16, 220),
      wall(180, 90, 256, 16), wall(524, 454, 256, 16),
      crate(280, 380, 52, 52), crate(560, 130, 52, 52), crate(760, 360, 52, 52),
      crate(90, 200, 44, 44), crate(820, 160, 44, 44),
    ],
    guards: [
      { path: [[300, 470, 1.2], [300, 160, 1.2]], speed: 62, range: 168, fov: 0.95, scan: false },
      { path: [[760, 470, 1.0], [560, 470, 0], [560, 180, 1.4], [760, 180, 0]], speed: 68, range: 176, fov: 0.95, scan: true },
    ],
  },
  {
    name: 'Vault 2 - Archive Stacks',
    hint: 'The stacks are your friends. Wait in shadow until a patrol turns its back.',
    start: { x: 56, y: 64 },
    exit: { x: 872, y: 452, w: 56, h: 56 },
    blocks: [
      wall(0, 0, 960, 12), wall(0, 548, 960, 12), wall(0, 0, 12, 560), wall(948, 0, 12, 560),
      wall(150, 120, 190, 16), wall(150, 280, 190, 16), wall(150, 440, 190, 16),
      wall(620, 120, 190, 16), wall(620, 280, 190, 16), wall(620, 440, 190, 16),
      wall(452, 60, 16, 180), wall(492, 320, 16, 180),
      crate(380, 470, 48, 48), crate(532, 42, 48, 48), crate(392, 190, 44, 44), crate(524, 330, 44, 44),
    ],
    guards: [
      { path: [[240, 200, 1.0], [720, 200, 1.0]], speed: 74, range: 182, fov: 1.0, scan: false },
      { path: [[720, 380, 1.0], [240, 380, 1.0]], speed: 74, range: 182, fov: 1.0, scan: false },
      { path: [[480, 520, 1.6], [480, 280, 0], [480, 40, 1.6]], speed: 66, range: 190, fov: 1.0, scan: true },
    ],
  },
  {
    name: 'Vault 3 - The Inner Vault',
    hint: 'Four guards, one vault. Chain your cover and move on the pauses.',
    start: { x: 56, y: 500 },
    exit: { x: 452, y: 24, w: 56, h: 48 },
    blocks: [
      wall(0, 0, 960, 12), wall(0, 548, 960, 12), wall(0, 0, 12, 560), wall(948, 0, 12, 560),
      wall(200, 140, 16, 280), wall(744, 140, 16, 280),
      wall(200, 140, 240, 16), wall(520, 140, 240, 16),
      wall(200, 404, 240, 16), wall(520, 404, 240, 16),
      wall(380, 250, 200, 16), wall(472, 180, 16, 86), wall(472, 294, 16, 86),
      crate(96, 300, 48, 48), crate(816, 212, 48, 48), crate(300, 470, 48, 48), crate(612, 42, 48, 48),
      crate(612, 470, 48, 48), crate(300, 42, 48, 48),
    ],
    guards: [
      { path: [[120, 90, 1.0], [840, 90, 1.0]], speed: 82, range: 190, fov: 1.02, scan: false },
      { path: [[840, 470, 1.0], [120, 470, 1.0]], speed: 82, range: 190, fov: 1.02, scan: false },
      { path: [[300, 280, 1.8], [660, 280, 1.8]], speed: 58, range: 178, fov: 1.05, scan: true },
      { path: [[480, 470, 1.4], [480, 330, 0], [620, 330, 0], [620, 470, 1.4], [340, 470, 0], [340, 330, 0]], speed: 70, range: 180, fov: 1.0, scan: true },
    ],
  },
];
