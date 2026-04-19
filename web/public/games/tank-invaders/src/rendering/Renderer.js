import { CANVAS_W, CANVAS_H, COLOR_BG, COLOR_SHELL_PLAYER, COLOR_SHELL_ENEMY } from '../constants.js';
import { drawPlayerTank, drawEnemyTank, drawExplosion } from './TankDrawer.js';
import { drawBunker }        from './BunkerDrawer.js';
import { drawHUD }           from './HUDDrawer.js';
import {
  drawTitleScreen,
  drawGameOverScreen,
  drawLevelCompleteScreen,
  drawPauseScreen,
} from './ScreenDrawer.js';

export class Renderer {
  constructor(canvas) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.animPhase = 0; // tread animation
    canvas.width  = CANVAS_W;
    canvas.height = CANVAS_H;
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const controlsH     = isTouchDevice ? window.innerHeight * 0.30 : 0;
    const availW = window.innerWidth;
    const availH = window.innerHeight - controlsH;
    const scale  = Math.min(availW / CANVAS_W, availH / CANVAS_H);

    this.canvas.style.width  = CANVAS_W + 'px';
    this.canvas.style.height = CANVAS_H + 'px';
    this.canvas.style.transform = `scale(${scale})`;
    this.canvas.style.transformOrigin = 'top center';
  }

  draw(game) {
    const ctx = this.ctx;
    this.animPhase = (this.animPhase + 0.04) % 1;

    // Background
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Scanlines (subtle)
    for (let y = 0; y < CANVAS_H; y += 4) {
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, y, CANVAS_W, 1);
    }

    if (game.state === 'TITLE') {
      drawTitleScreen(ctx, game.stateTime);
      return;
    }

    // Bunkers
    for (const b of game.bunkers) drawBunker(ctx, b);

    // Shells
    for (const s of game.shells) {
      if (!s.active) continue;
      ctx.fillStyle = s.owner === 'player' ? COLOR_SHELL_PLAYER : COLOR_SHELL_ENEMY;
      ctx.shadowColor = s.owner === 'player' ? COLOR_SHELL_PLAYER : COLOR_SHELL_ENEMY;
      ctx.shadowBlur  = 6;
      ctx.fillRect(s.x - s.w / 2, s.y - s.h / 2, s.w, s.h);
    }
    ctx.shadowBlur = 0;

    // Enemy tanks
    if (game.formation) {
      for (const t of game.formation.tanks) {
        if (!t.active) continue;
        drawEnemyTank(ctx, t.x, t.y, t.type, this.animPhase);
      }
    }

    // Explosions
    for (const ex of game.explosions) {
      drawExplosion(ctx, ex.x, ex.y, ex.t);
    }

    // Player tank
    const p = game.player;
    if (!p.dead) {
      const flash = p.invincible > 0 && Math.floor(p.invincible * 6) % 2 === 0;
      drawPlayerTank(ctx, p.x, p.y, flash);
    }

    // HUD
    drawHUD(ctx, game.score.current, game.score.hi, p.lives, game.level);

    // State overlays
    if (game.state === 'GAME_OVER')       drawGameOverScreen(ctx, game.score.current, game.score.hi);
    if (game.state === 'LEVEL_COMPLETE')  drawLevelCompleteScreen(ctx, game.level, game.stateTime);
    if (game.state === 'PAUSED')          drawPauseScreen(ctx);
  }
}
