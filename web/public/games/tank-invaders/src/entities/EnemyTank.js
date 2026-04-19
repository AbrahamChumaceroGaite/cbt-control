import { Entity } from './Entity.js';

export class EnemyTank extends Entity {
  constructor(x, y, type) {
    super(x, y, 38, 30);
    this.type = type; // 'light' | 'medium' | 'heavy'
    this.row  = 0;
    this.col  = 0;
  }
}
