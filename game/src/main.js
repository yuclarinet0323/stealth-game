// Shadow Shift: Night Vault - browser entry point.
// Wires keyboard and mouse into the engine, runs the fixed-step loop,
// paints with render.js, and plays tiny WebAudio blips (generated, no
// audio files). Supports ?shot= staging for screenshots.

import { Game, SCREEN_PLAY } from './engine.js';
import { draw, VIEW_W, VIEW_H } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const game = new Game();
const params = new URLSearchParams(location.search);
const shotName = params.get('shot');
if (shotName) stageShot(shotName, game);

let audio = null;
function blip(freq, dur = 0.09, type = 'square', gain = 0.05) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = type; osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g); g.connect(audio.destination);
    osc.start(); osc.stop(audio.currentTime + dur);
  } catch { /* sound is optional */ }
}

const KEYMAP = {
  arrowleft: 'left', a: 'left',
  arrowright: 'right', d: 'right',
  arrowup: 'up', w: 'up',
  arrowdown: 'down', s: 'down',
  shift: 'shift',
};
let wasSeen = false;
let prevScreen = game.screen;

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (KEYMAP[key]) { game.keys.add(KEYMAP[key]); event.preventDefault(); }
  if (key === 'enter' || key === ' ') { game.confirm(); blip(520, 0.07); event.preventDefault(); }
  if (key === 'r' && game.screen === SCREEN_PLAY) { game.loadLevel(game.levelIndex); }
});
window.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase();
  if (KEYMAP[key]) game.keys.delete(KEYMAP[key]);
});
canvas.addEventListener('pointerdown', () => { game.confirm(); blip(520, 0.07); });

function frame(now) {
  const dt = Math.min(0.033, (now - (frame.last || now)) / 1000);
  frame.last = now;
  if (!shotName) game.update(dt);
  else game.time += dt; // keep exit pulse alive in staged shots
  if (game.seenBy > 0 && !wasSeen) blip(880, 0.08, 'sawtooth', 0.04);
  wasSeen = game.seenBy > 0;
  if (game.screen !== prevScreen) {
    if (game.screen === 'caught') blip(160, 0.25, 'sawtooth', 0.07);
    if (game.screen === 'clear' || game.screen === 'win') blip(740, 0.16, 'triangle', 0.06);
    prevScreen = game.screen;
    status.textContent = `Shadow Shift: ${game.screen}, ${game.level.name}, detection ${Math.round(game.detection * 100)} percent`;
  }
  draw(ctx, game);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
