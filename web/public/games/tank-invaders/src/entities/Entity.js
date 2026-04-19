export class Entity {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.active = true;
  }

  get left()   { return this.x - this.w / 2; }
  get right()  { return this.x + this.w / 2; }
  get top()    { return this.y - this.h / 2; }
  get bottom() { return this.y + this.h / 2; }

  overlaps(other) {
    return (
      this.left   < other.right  &&
      this.right  > other.left   &&
      this.top    < other.bottom &&
      this.bottom > other.top
    );
  }
}
