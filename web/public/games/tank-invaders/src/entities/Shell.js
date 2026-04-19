import { Entity } from './Entity.js';
import { SHELL_SPEED_PLAYER, SHELL_SPEED_ENEMY } from '../constants.js';

export class Shell extends Entity {
  constructor(x, y, owner) {
    super(x, y, 6, 14);
    this.owner = owner; // 'player' | 'enemy'
    this.vy = owner === 'player' ? -SHELL_SPEED_PLAYER : SHELL_SPEED_ENEMY;
  }

  update(dt) {
    this.y += this.vy * dt;
  }
}
