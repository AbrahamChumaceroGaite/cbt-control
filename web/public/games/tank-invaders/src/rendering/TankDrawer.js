import {
  COLOR_PLAYER_HULL, COLOR_PLAYER_TREAD, COLOR_PLAYER_TURRET, COLOR_PLAYER_BARREL,
  ENEMY_COLORS,
} from '../constants.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw player tank centered at (cx, cy), facing UP.
 */
export function drawPlayerTank(ctx, cx, cy, flash) {
  if (flash) {
    ctx.globalAlpha = 0.45;
  }

  // Treads
  ctx.fillStyle = COLOR_PLAYER_TREAD;
  roundRect(ctx, cx - 22, cy - 14, 9, 28, 3);
  roundRect(ctx, cx + 13, cy - 14, 9, 28, 3);

  // Tread segments
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth   = 1.5;
  for (let i = 0; i < 5; i++) {
    const ty = cy - 10 + i * 5;
    ctx.beginPath(); ctx.moveTo(cx - 22, ty); ctx.lineTo(cx - 13, ty); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 13, ty); ctx.lineTo(cx + 22, ty); ctx.stroke();
  }

  // Hull
  ctx.fillStyle = COLOR_PLAYER_HULL;
  roundRect(ctx, cx - 13, cy - 12, 26, 24, 4);

  // Turret
  ctx.fillStyle = COLOR_PLAYER_TURRET;
  roundRect(ctx, cx - 8, cy - 8, 16, 16, 3);

  // Barrel (facing up)
  ctx.fillStyle = COLOR_PLAYER_BARREL;
  ctx.fillRect(cx - 3, cy - 24, 6, 18);

  // Muzzle brake
  ctx.fillRect(cx - 5, cy - 26, 10, 5);

  ctx.globalAlpha = 1;
}

/**
 * Draw enemy tank centered at (cx, cy), facing DOWN.
 * type: 'light' | 'medium' | 'heavy'
 * animPhase: 0 or 1 for tread animation
 */
export function drawEnemyTank(ctx, cx, cy, type, animPhase) {
  const c = ENEMY_COLORS[type];

  // Treads
  ctx.fillStyle = c.tread;
  const tw = type === 'heavy' ? 10 : 9;
  roundRect(ctx, cx - 22, cy - 14, tw, 28, 3);
  roundRect(ctx, cx + 22 - tw, cy - 14, tw, 28, 3);

  // Tread segments (offset by animPhase for crawling effect)
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth   = 1.5;
  const off = animPhase * 2.5;
  for (let i = 0; i < 6; i++) {
    const ty = cy - 12 + ((i * 5 + off) % 28);
    ctx.beginPath(); ctx.moveTo(cx - 22, ty); ctx.lineTo(cx - 22 + tw, ty); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 22 - tw, ty); ctx.lineTo(cx + 22, ty); ctx.stroke();
  }

  // Hull
  ctx.fillStyle = c.hull;
  const hw = type === 'heavy' ? 28 : 24;
  roundRect(ctx, cx - hw / 2, cy - 12, hw, 24, 4);

  // Extra hull detail for heavy
  if (type === 'heavy') {
    ctx.fillStyle = c.tread;
    ctx.fillRect(cx - 10, cy - 8, 20, 4);
  }

  // Turret
  ctx.fillStyle = c.turret;
  const ts = type === 'light' ? 13 : 15;
  roundRect(ctx, cx - ts / 2, cy - ts / 2, ts, ts, 3);

  // Barrel (facing down)
  ctx.fillStyle = c.barrel;
  const bw = type === 'heavy' ? 8 : 6;
  ctx.fillRect(cx - bw / 2, cy + 6, bw, 18);

  // Muzzle brake
  if (type !== 'light') {
    ctx.fillRect(cx - bw / 2 - 2, cy + 22, bw + 4, 4);
  }
}

/**
 * Draw a small explosion at (cx, cy), t = 0..1
 */
export function drawExplosion(ctx, cx, cy, t) {
  const rays = 8;
  const maxR = 28;
  ctx.save();
  ctx.globalAlpha = (1 - t) * 0.9;
  for (let i = 0; i < rays; i++) {
    const angle = (i / rays) * Math.PI * 2;
    const r     = maxR * t;
    const x2    = cx + Math.cos(angle) * r;
    const y2    = cy + Math.sin(angle) * r;
    const hue   = 30 + Math.floor(t * 60);
    ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
    ctx.lineWidth   = 3 * (1 - t) + 1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * r * 0.2, cy + Math.sin(angle) * r * 0.2);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  // Central flash
  ctx.fillStyle = `rgba(255,220,80,${(1-t)*0.8})`;
  ctx.beginPath();
  ctx.arc(cx, cy, 10 * (1 - t), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
