import { CANVAS_W, COLOR_HUD_TEXT, COLOR_HUD_DIM } from '../constants.js';
import { drawPlayerTank } from './TankDrawer.js';

export function drawHUD(ctx, score, hiScore, lives, level) {
  // Top bar background
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, CANVAS_W, 36);

  ctx.font      = 'bold 14px "Courier New", monospace';
  ctx.textBaseline = 'middle';

  // Score
  ctx.fillStyle = COLOR_HUD_DIM;
  ctx.fillText('SCORE', 14, 11);
  ctx.fillStyle = COLOR_HUD_TEXT;
  ctx.font      = 'bold 18px "Courier New", monospace';
  ctx.fillText(String(score).padStart(6, '0'), 14, 26);

  // Hi-Score
  ctx.font      = 'bold 14px "Courier New", monospace';
  ctx.fillStyle = COLOR_HUD_DIM;
  ctx.textAlign = 'center';
  ctx.fillText('HI-SCORE', CANVAS_W / 2, 11);
  ctx.fillStyle = COLOR_HUD_TEXT;
  ctx.font      = 'bold 18px "Courier New", monospace';
  ctx.fillText(String(hiScore).padStart(6, '0'), CANVAS_W / 2, 26);

  // Level
  ctx.font      = 'bold 14px "Courier New", monospace';
  ctx.fillStyle = COLOR_HUD_DIM;
  ctx.textAlign = 'right';
  ctx.fillText('LEVEL', CANVAS_W - 14, 11);
  ctx.fillStyle = COLOR_HUD_TEXT;
  ctx.font      = 'bold 18px "Courier New", monospace';
  ctx.fillText(String(level).padStart(2, ' '), CANVAS_W - 14, 26);
  ctx.textAlign = 'left';

  // Lives — draw mini tanks
  const lifeY = 585;
  ctx.fillStyle = COLOR_HUD_DIM;
  ctx.font      = '12px "Courier New", monospace';
  ctx.fillText('LIVES:', 10, lifeY);
  ctx.save();
  ctx.scale(0.45, 0.45);
  for (let i = 0; i < lives; i++) {
    drawPlayerTank(ctx, (80 + i * 52) / 0.45, lifeY / 0.45, false);
  }
  ctx.restore();

  // Bottom divider line
  ctx.strokeStyle = 'rgba(80,160,40,0.3)';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(0, 36);
  ctx.lineTo(CANVAS_W, 36);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 570);
  ctx.lineTo(CANVAS_W, 570);
  ctx.stroke();
}
