import { EnemyTank } from './EnemyTank.js';
import {
  CANVAS_W,
  ENEMY_COLS, ENEMY_ROWS,
  ENEMY_SPACING_X, ENEMY_SPACING_Y,
  ENEMY_FORMATION_TOP, ENEMY_DESCENT_PX, ENEMY_EDGE_MARGIN,
  ENEMY_FIRE_INTERVAL_BASE,
} from '../constants.js';

const TYPES = ['heavy', 'medium', 'medium', 'light']; // row 0 = bottom (heavy)

export class EnemyFormation {
  constructor(level) {
    this.tanks    = [];
    this.dx       = 1;   // direction: +1 right, -1 left
    this.speed    = 40 + (level - 1) * 15;
    this.fireInterval = Math.max(0.3, ENEMY_FIRE_INTERVAL_BASE - (level - 1) * 0.2);
    this.fireTimer    = this.fireInterval;
    this.marchTimer   = 0;
    this.marchInterval = 0.6; // sec between "step" sound ticks
    this.onMarch = null; // callback for march sound

    // Anchor = center-x of formation, top-y of top row
    const totalW = (ENEMY_COLS - 1) * ENEMY_SPACING_X;
    this.anchorX = (CANVAS_W - totalW) / 2 + totalW / 2;
    this.anchorY = ENEMY_FORMATION_TOP;

    this._build();
  }

  _build() {
    this.tanks = [];
    const totalW = (ENEMY_COLS - 1) * ENEMY_SPACING_X;
    const startX = (CANVAS_W - totalW) / 2;

    for (let row = 0; row < ENEMY_ROWS; row++) {
      const type = TYPES[Math.min(row, TYPES.length - 1)];
      for (let col = 0; col < ENEMY_COLS; col++) {
        const t = new EnemyTank(
          startX + col * ENEMY_SPACING_X,
          this.anchorY + row * ENEMY_SPACING_Y,
          type,
        );
        t.row = row;
        t.col = col;
        this.tanks.push(t);
      }
    }
  }

  get alive() {
    return this.tanks.filter(t => t.active);
  }

  get count() {
    return this.tanks.filter(t => t.active).length;
  }

  /** Returns a Shell origin {x, y} if an enemy fires this frame, else null */
  update(dt) {
    const living = this.alive;
    if (living.length === 0) return null;

    // Speed scales up as enemies are killed
    const fraction  = living.length / (ENEMY_COLS * ENEMY_ROWS);
    const currentSpeed = this.speed / Math.max(fraction, 0.1);

    // Move all tanks
    let hitEdge = false;
    for (const t of living) {
      t.x += this.dx * currentSpeed * dt;
      if (this.dx > 0 && t.right > CANVAS_W - ENEMY_EDGE_MARGIN) hitEdge = true;
      if (this.dx < 0 && t.left  < ENEMY_EDGE_MARGIN)             hitEdge = true;
    }

    if (hitEdge) {
      this.dx *= -1;
      for (const t of living) t.y += ENEMY_DESCENT_PX;
    }

    // March sound tick
    this.marchTimer -= dt;
    if (this.marchTimer <= 0) {
      this.marchTimer = Math.max(0.1, 0.6 * fraction);
      if (this.onMarch) this.onMarch();
    }

    // Random enemy fires
    this.fireTimer -= dt;
    if (this.fireTimer <= 0) {
      this.fireTimer = Math.max(0.2, this.fireInterval * fraction + Math.random() * 0.4);
      const shooter = living[Math.floor(Math.random() * living.length)];
      return { x: shooter.x, y: shooter.bottom };
    }

    return null;
  }

  hasReachedPlayer() {
    return this.alive.some(t => t.bottom >= 510);
  }
}
