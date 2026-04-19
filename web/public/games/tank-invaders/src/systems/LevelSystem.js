export class LevelSystem {
  constructor() {
    this.level = 1;
  }

  next() {
    this.level++;
  }

  reset() {
    this.level = 1;
  }
}
