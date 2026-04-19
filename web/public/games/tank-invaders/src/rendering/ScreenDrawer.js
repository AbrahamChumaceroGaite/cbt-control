import { CANVAS_W, CANVAS_H, COLOR_HUD_TEXT } from '../constants.js';
import { drawPlayerTank, drawEnemyTank } from './TankDrawer.js';

function overlay(ctx, alpha = 0.7) {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

function centeredText(ctx, text, y, size, color = COLOR_HUD_TEXT) {
  ctx.font      = `bold ${size}px "Courier New", monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(text, CANVAS_W / 2, y);
}

function smallText(ctx, text, y, color = 'rgba(140,200,80,0.75)') {
  centeredText(ctx, text, y, 15, color);
}

export function drawTitleScreen(ctx, t) {
  overlay(ctx, 0.82);

  // Animated title glow
  const glow = 8 + Math.sin(t * 2) * 4;
  ctx.shadowColor = '#88ff44';
  ctx.shadowBlur  = glow;
  centeredText(ctx, 'TANK INVADERS', 180, 52, '#aaffaa');
  ctx.shadowBlur = 0;

  // Subtitle
  centeredText(ctx, '— ARMORED ASSAULT —', 220, 16, 'rgba(140,200,80,0.7)');

  // Demo tanks
  ctx.save();
  ctx.scale(1.4, 1.4);
  drawPlayerTank(ctx, CANVAS_W / 2 / 1.4, 290 / 1.4, false);
  drawEnemyTank(ctx,  CANVAS_W / 2 / 1.4 - 80, 270 / 1.4, 'light',  0);
  drawEnemyTank(ctx,  CANVAS_W / 2 / 1.4 + 80, 270 / 1.4, 'medium', 1);
  ctx.restore();

  // Score table
  centeredText(ctx, 'SCORE ADVANCE TABLE', 355, 16, '#aaffaa');
  const rows = [
    { type: 'heavy',  pts: 40, label: 'HEAVY TANK' },
    { type: 'medium', pts: 20, label: 'MEDIUM TANK' },
    { type: 'light',  pts: 10, label: 'LIGHT TANK' },
  ];
  ctx.save();
  ctx.scale(0.6, 0.6);
  rows.forEach((row, i) => {
    const cy = (380 + i * 48) / 0.6;
    drawEnemyTank(ctx, (CANVAS_W / 2 - 70) / 0.6, cy, row.type, 0);
    ctx.font      = '26px "Courier New", monospace';
    ctx.fillStyle = COLOR_HUD_TEXT;
    ctx.textAlign = 'left';
    ctx.fillText(`= ${row.pts} PTS  ${row.label}`, (CANVAS_W / 2 - 40) / 0.6, cy + 8);
  });
  ctx.restore();

  // Blink "press space / tap fire"
  if (Math.floor(t * 2) % 2 === 0) {
    smallText(ctx, '[ SPACE / TAP FIRE TO START ]', 530, '#ffee44');
  }
}

export function drawGameOverScreen(ctx, score, hiScore) {
  overlay(ctx, 0.78);

  ctx.shadowColor = '#ff4422';
  ctx.shadowBlur  = 16;
  centeredText(ctx, 'GAME OVER', 240, 54, '#ff6644');
  ctx.shadowBlur = 0;

  centeredText(ctx, `SCORE  ${String(score).padStart(6, '0')}`, 310, 20, COLOR_HUD_TEXT);
  if (score >= hiScore && score > 0) {
    centeredText(ctx, 'NEW HI-SCORE!', 340, 16, '#ffee44');
  } else {
    centeredText(ctx, `HI-SCORE  ${String(hiScore).padStart(6, '0')}`, 340, 16, 'rgba(140,200,80,0.6)');
  }

  smallText(ctx, '[ SPACE / TAP FIRE TO RESTART ]', 410);
}

export function drawLevelCompleteScreen(ctx, level, t) {
  overlay(ctx, 0.65);

  const pulse = 0.8 + Math.sin(t * 4) * 0.2;
  ctx.globalAlpha = pulse;
  centeredText(ctx, `LEVEL ${level} CLEAR!`, 260, 44, '#ffee44');
  ctx.globalAlpha = 1;

  centeredText(ctx, `PREPARE FOR LEVEL ${level + 1}`, 310, 18, COLOR_HUD_TEXT);
  smallText(ctx, 'ENEMY FORCES ADVANCING...', 345, 'rgba(255,100,60,0.8)');
}

export function drawPauseScreen(ctx) {
  overlay(ctx, 0.55);
  centeredText(ctx, 'PAUSED', CANVAS_H / 2, 42, COLOR_HUD_TEXT);
  smallText(ctx, '[ P / ESC TO RESUME ]', CANVAS_H / 2 + 40);
}
