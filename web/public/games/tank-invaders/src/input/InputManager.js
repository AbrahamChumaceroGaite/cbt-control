import { KeyboardInput } from './KeyboardInput.js';
import { TouchInput }    from './TouchInput.js';

export class InputManager {
  constructor() {
    this.actions = { left: false, right: false, fire: false, pause: false };
    this._keyboard = new KeyboardInput(this.actions);
    this._touch    = new TouchInput(this.actions);
    this._prevPause = false;
    this._prevFire  = false;
  }

  /** Returns true once per pause key press (edge-triggered) */
  consumePause() {
    const v = this.actions.pause && !this._prevPause;
    this._prevPause = this.actions.pause;
    return v;
  }

  /** Returns true on first frame fire is held (for title/game-over screens) */
  consumeFire() {
    const v = this.actions.fire && !this._prevFire;
    this._prevFire = this.actions.fire;
    return v;
  }

  tick() {
    // Update edge-detection state at end of each frame
    this._prevPause = this.actions.pause;
    this._prevFire  = this.actions.fire;
  }

  destroy() {
    this._keyboard.destroy();
    this._touch.destroy();
  }
}
