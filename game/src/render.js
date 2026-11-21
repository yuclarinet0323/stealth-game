// Shadow Shift: Night Vault - canvas rendering.
// Everything is drawn with shapes: tiled floors, panelled walls, wooden
// crates, guards with soft vision cones built from the engine's own ray
// casts, and a hooded intruder for the player. No images, no fonts loaded.

import { FIELD_W, FIELD_H, HUD_H } from './levels.js';
import { rayDistance, SCREEN_TITLE, SCREEN_PLAY, SCREEN_CAUGHT, SCREEN_CLEAR, SCREEN_WIN } from './engine.js';

export const VIEW_W = FIELD_W;
export const VIEW_H = FIELD_H + HUD_H;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawCone(ctx, guard, blocks, alertLevel) {
  const rays = 26;
  const start = guard.angle - guard.def.fov;
  const end = guard.angle + guard.def.fov;
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y + HUD_H);
  for (let i = 0; i <= rays; i += 1) {
    const a = start + ((end - start) * i) / rays;
    const d = rayDistance(guard.x, guard.y, a, guard.def.range, blocks);
    ctx.lineTo(guard.x + Math.cos(a) * d, guard.y + HUD_H + Math.sin(a) * d);
  }
  ctx.closePath();
  const seen = alertLevel > 0;
  const grad = ctx.createRadialGradient(guard.x, guard.y + HUD_H, 8, guard.x, guard.y + HUD_H, guard.def.range);
  if (seen) {
    grad.addColorStop(0, 'rgba(255,84,72,0.50)');
    grad.addColorStop(1, 'rgba(255,84,72,0.05)');
  } else {
    grad.addColorStop(0, 'rgba(255,214,110,0.40)');
    grad.addColorStop(1, 'rgba(255,214,110,0.03)');
  }
  ctx.fillStyle = grad;
  ctx.fill();
}

function drawBlock(ctx, b) {
  const y = b.y + HUD_H;
  if (b.kind === 'crate') {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(b.x, y, b.w, b.h);
    ctx.strokeStyle = '#5d3a17';
    ctx.lineWidth = 3;
    ctx.strokeRect(b.x + 2, y + 2, b.w - 4, b.h - 4);
    ctx.beginPath();
    ctx.moveTo(b.x + 3, y + 3); ctx.lineTo(b.x + b.w - 3, y + b.h - 3);
    ctx.moveTo(b.x + b.w - 3, y + 3); ctx.lineTo(b.x + 3, y + b.h - 3);
    ctx.strokeStyle = 'rgba(93,58,23,0.65)';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    ctx.fillStyle = '#2c3550';
    ctx.fillRect(b.x, y, b.w, b.h);
    ctx.fillStyle = '#39466a';
    ctx.fillRect(b.x, y, b.w, 4);
    ctx.strokeStyle = '#171d31';
    ctx.lineWidth = 1;
    ctx.strokeRect(b.x + 0.5, y + 0.5, b.w - 1, b.h - 1);
  }
}

function drawGuard(ctx, guard, seen) {
  const y = guard.y + HUD_H;
  ctx.save();
  ctx.translate(guard.x, y);
  ctx.rotate(guard.angle);
  // Shoulders / uniform
  ctx.fillStyle = seen ? '#c23b31' : '#37507e';
  ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#22314f';
  ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
  // Facing wedge + lamp
  ctx.fillStyle = '#ffd66e';
  ctx.beginPath(); ctx.arc(11, 0, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  if (seen) {
    ctx.fillStyle = '#ff5545';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', guard.x, y - 22);
  }
}

function drawPlayer(ctx, player, sneaking) {
  const y = player.y + HUD_H;
  ctx.save();
  ctx.translate(player.x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(0, 9, 13, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = sneaking ? '#1d7a52' : '#27ae6e';
  ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill();
  // Hood
  ctx.fillStyle = '#14563a';
  ctx.beginPath(); ctx.arc(0, -2, 8.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f2d5a0';
  ctx.beginPath(); ctx.arc(0, -1, 4.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawExit(ctx, exit, t) {
  const y = exit.y + HUD_H;
  const pulse = 0.65 + Math.sin(t * 3.2) * 0.25;
  ctx.fillStyle = `rgba(64,224,160,${0.28 + pulse * 0.2})`;
  ctx.fillRect(exit.x, y, exit.w, exit.h);
  ctx.strokeStyle = '#40e0a0';
  ctx.lineWidth = 3;
  ctx.strokeRect(exit.x + 2, y + 2, exit.w - 4, exit.h - 4);
  ctx.fillStyle = '#bffce4';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', exit.x + exit.w / 2, y + exit.h / 2 + 5);
}

function panel(ctx, title, lines, buttonLabel) {
  ctx.fillStyle = 'rgba(5,8,16,0.55)';
  ctx.fillRect(0, HUD_H, VIEW_W, FIELD_H);
  const w = 560, h = 264, x = (VIEW_W - w) / 2, y = HUD_H + (FIELD_H - h) / 2;
  ctx.fillStyle = '#131a2e';
  roundRect(ctx, x, y, w, h, 14); ctx.fill();
  ctx.strokeStyle = '#40e0a0'; ctx.lineWidth = 2; ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f4f7ff';
  ctx.font = 'bold 34px system-ui, sans-serif';
  ctx.fillText(title, VIEW_W / 2, y + 58);
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillStyle = '#c6d2ea';
  lines.forEach((line, i) => ctx.fillText(line, VIEW_W / 2, y + 102 + i * 27));
  if (buttonLabel) {
    ctx.fillStyle = '#27ae6e';
    roundRect(ctx, VIEW_W / 2 - 120, y + h - 62, 240, 40, 9); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.fillText(buttonLabel, VIEW_W / 2, y + h - 36);
  }
}

export function draw(ctx, game) {
  ctx.fillStyle = '#0b0e17';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Floor tiles
  ctx.fillStyle = '#1a2138';
  ctx.fillRect(0, HUD_H, FIELD_W, FIELD_H);
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= FIELD_W; x += 48) { ctx.beginPath(); ctx.moveTo(x, HUD_H); ctx.lineTo(x, VIEW_H); ctx.stroke(); }
  for (let y = 0; y <= FIELD_H; y += 48) { ctx.beginPath(); ctx.moveTo(0, HUD_H + y); ctx.lineTo(FIELD_W, HUD_H + y); ctx.stroke(); }

  const level = game.level;
  drawExit(ctx, level.exit, game.time);
  for (const guard of game.guards) drawCone(ctx, guard, level.blocks, game.seenBy);
  for (const b of level.blocks) drawBlock(ctx, b);
  for (const guard of game.guards) drawGuard(ctx, guard, game.seenBy > 0 && guard.sees(game.player.x, game.player.y, game.sneaking) > 0);
  if (game.screen !== SCREEN_TITLE) drawPlayer(ctx, game.player, game.sneaking);

  // HUD
  ctx.fillStyle = '#0e1424';
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.fillStyle = '#f4f7ff';
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Shadow Shift - ${level.name}`, 16, 35);
  ctx.textAlign = 'right';
  ctx.font = '16px system-ui, sans-serif';
  const mm = Math.floor(game.totalTime / 60), ss = Math.floor(game.totalTime % 60).toString().padStart(2, '0');
  ctx.fillText(`Time ${mm}:${ss}   Caught x${game.caughtCount}`, VIEW_W - 190, 35);
  // Detection meter
  ctx.fillStyle = '#26304d'; ctx.fillRect(VIEW_W - 172, 18, 156, 20);
  ctx.fillStyle = game.detection > 0.65 ? '#ff5545' : game.detection > 0.3 ? '#ffb84d' : '#40e0a0';
  ctx.fillRect(VIEW_W - 170, 20, 152 * Math.min(1, game.detection), 16);
  ctx.strokeStyle = '#7f8db0'; ctx.lineWidth = 1; ctx.strokeRect(VIEW_W - 172.5, 17.5, 157, 21);
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 11px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 3;
  ctx.fillText('DETECTION', VIEW_W - 94, 33);
  ctx.shadowBlur = 0;

  // Message strip
  if (game.screen === SCREEN_PLAY && game.message) {
    ctx.fillStyle = 'rgba(8,11,20,0.82)';
    ctx.fillRect(0, VIEW_H - 34, VIEW_W, 34);
    ctx.fillStyle = '#dce6fa'; ctx.font = '15px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(game.message, VIEW_W / 2, VIEW_H - 12);
  }
  if (game.flash > 0) { ctx.fillStyle = `rgba(255,60,50,${game.flash * 0.5})`; ctx.fillRect(0, HUD_H, FIELD_W, FIELD_H); }

  if (game.screen === SCREEN_TITLE) {
    drawPlayer(ctx, { x: 480, y: 300 }, false);
    panel(ctx, 'SHADOW SHIFT: NIGHT VAULT', [
      'Sneak through three guarded vaults and reach the EXIT unseen.',
      'Guards see in a cone - walls and crates block their sight.',
      'Move: WASD / Arrow keys    Sneak slowly: hold Shift',
      'Fill the DETECTION meter and you are caught. Hide to let it fall.',
    ], 'Click or press Enter to start');
  } else if (game.screen === SCREEN_CAUGHT) {
    panel(ctx, 'CAUGHT!', [
      'A guard held you in sight until the meter filled.',
      `Room: ${level.name}    Times caught: ${game.caughtCount}`,
      'Tip: break line of sight behind a wall or crate,',
      'or sneak with Shift - you are spotted more slowly.',
    ], 'Click or press Enter to retry');
  } else if (game.screen === SCREEN_CLEAR) {
    panel(ctx, 'ROOM CLEARED - UNSEEN', [
      `${level.name} is behind you.`,
      `Total time so far: ${Math.floor(game.totalTime / 60)}:${Math.floor(game.totalTime % 60).toString().padStart(2, '0')}   Caught: x${game.caughtCount}`,
      'The next vault has tighter patrols. Stay in the shadows.',
    ], 'Click or press Enter to continue');
  } else if (game.screen === SCREEN_WIN) {
    panel(ctx, 'VAULT EMPTIED - GHOST!', [
      'All three vaults crossed, and the Night Vault is yours.',
      `Final time: ${Math.floor(game.totalTime / 60)}:${Math.floor(game.totalTime % 60).toString().padStart(2, '0')}    Times caught: ${game.caughtCount}`,
      game.caughtCount === 0 ? 'A perfect ghost run - never caught once.' : 'Try again for a clean ghost run: caught x0.',
      'Thanks for playing Shadow Shift.',
    ], 'Click or press Enter for title');
  }
}
