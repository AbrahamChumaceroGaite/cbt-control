import { Entity } from './Entity.js';
import { CANVAS_W, PLAYER_SPEED, PLAYER_FIRE_COOLDOWN, PLAYER_Y, LIVES_START } from '../constants.js';

export class PlayerTank extends Entity {
  constructor() {
    super(CANVAS_W / 2, PLAYER_Y, 44, 28);
    this.lives        = LIVES_START;
    this.fireCooldown = 0;
    this.invincible   = 0; // seconds of hit-flash invincibility
    this.dead         = false;
  }

  update(dt, actions, shells, maxShells) {
    if (this.dead) return;

    if (this.invincible > 0) this.invincible -= dt;

    // Movement
    const dx = (actions.right ? 1 : 0) - (actions.left ? 1 : 0);
    this.x = Math.max(this.w / 2, Math.min(CANVAS_W - this.w / 2, this.x + dx * PLAYER_SPEED * dt));

    // Fire cooldown
    if (this.fireCooldown > 0) this.fireCooldown -= dt;

    // Fire
    const playerShells = shells.filter(s => s.owner === 'player').length;
    if (actions.fire && this.fireCooldown <= 0 && playerShells < maxShells) {
      this.fireCooldown = PLAYER_FIRE_COOLDOWN;
      return true; // signal: spawn shell
    }
    return false;
  }

  hit() {
    if (this.invincible > 0) return false;
    this.lives--;
    this.invincible = 2.0;
    if (this.lives <= 0) this.dead = true;
    return true;
  }

  reset() {
    this.x          = CANVAS_W / 2;
    this.fireCooldown = 0;
    this.invincible  = 1.5;
    this.dead        = false;
  }
}
