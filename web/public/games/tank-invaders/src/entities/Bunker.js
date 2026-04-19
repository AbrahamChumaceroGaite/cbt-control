import { BUNKER_COLS, BUNKER_ROWS, BUNKER_PIXEL_SIZE, BUNKER_CRATER_R } from '../constants.js';

const W = BUNKER_COLS;
const H = BUNKER_ROWS;

function makeMask() {
  // Classic Space Invaders bunker silhouette (arch-shape with notch at bottom-center)
  const mask = Array.from({ length: H }, () => new Uint8Array(W).fill(1));

  // Round the top corners (3×3 squares cut off)
  const CR = 3;
  for (let r = 0; r < CR; r++) {
    for (let c = 0; c < CR - r; c++) {
      mask[r][c] = 0;
      mask[r][W - 1 - c] = 0;
    }
  }

  // Cut out the bottom-center arch opening (6 wide × 5 tall)
  const archW = 6;
  const archH = 5;
  const archLeft = Math.floor((W - archW) / 2);
  for (let r = H - archH; r < H; r++) {
    for (let c = archLeft; c < archLeft + archW; c++) {
      mask[r][c] = 0;
    }
  }

  return mask;
}

export class Bunker {
  constructor(x, y) {
    this.x = x; // top-left pixel
    this.y = y;
    this.pixels = makeMask();
  }

  get w() { return W * BUNKER_PIXEL_SIZE; }
  get h() { return H * BUNKER_PIXEL_SIZE; }
  get left()   { return this.x; }
  get right()  { return this.x + this.w; }
  get top()    { return this.y; }
  get bottom() { return this.y + this.h; }

  /** Check if a shell AABB hits this bunker and apply crater. Returns true if hit. */
  handleShell(shell) {
    if (shell.right < this.left || shell.left > this.right) return false;
    if (shell.bottom < this.top || shell.top > this.bottom) return false;

    // Convert shell center to bunker pixel coords
    const pc = Math.floor((shell.x - this.x) / BUNKER_PIXEL_SIZE);
    const pr = Math.floor((shell.y - this.y) / BUNKER_PIXEL_SIZE);

    // Check if actually hitting a live pixel
    let hit = false;
    const r = BUNKER_CRATER_R;
    for (let dr = -r; dr <= r; dr++) {
      for (let dc = -r; dc <= r; dc++) {
        const rr = pr + dr;
        const cc = pc + dc;
        if (rr >= 0 && rr < H && cc >= 0 && cc < W) {
          if (this.pixels[rr][cc]) hit = true;
          this.pixels[rr][cc] = 0;
        }
      }
    }
    return hit;
  }

  reset() {
    this.pixels = makeMask();
  }
}
