import { BUNKER_PIXEL_SIZE, COLOR_BUNKER, COLOR_BUNKER_DARK } from '../constants.js';

const PS = BUNKER_PIXEL_SIZE;

export function drawBunker(ctx, bunker) {
  const pixels = bunker.pixels;
  for (let r = 0; r < pixels.length; r++) {
    for (let c = 0; c < pixels[r].length; c++) {
      if (!pixels[r][c]) continue;
      const px = bunker.x + c * PS;
      const py = bunker.y + r * PS;
      ctx.fillStyle = (r + c) % 2 === 0 ? COLOR_BUNKER : COLOR_BUNKER_DARK;
      ctx.fillRect(px, py, PS - 1, PS - 1);
    }
  }
}
