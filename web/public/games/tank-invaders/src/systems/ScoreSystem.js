import { SCORE_LIGHT, SCORE_MEDIUM, SCORE_HEAVY } from '../constants.js';

const POINTS = { light: SCORE_LIGHT, medium: SCORE_MEDIUM, heavy: SCORE_HEAVY };
const HI_KEY = 'tankInvaders_hiScore';

export class ScoreSystem {
  constructor() {
    this.current = 0;
    this.hi = parseInt(localStorage.getItem(HI_KEY) || '0', 10);
  }

  add(enemyType) {
    this.current += POINTS[enemyType] ?? 10;
    if (this.current > this.hi) {
      this.hi = this.current;
      localStorage.setItem(HI_KEY, String(this.hi));
    }
  }

  reset() {
    this.current = 0;
  }
}
