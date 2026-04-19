export class KeyboardInput {
  constructor(actions) {
    this.actions = actions;
    this._onDown = this._onDown.bind(this);
    this._onUp   = this._onUp.bind(this);
    window.addEventListener('keydown', this._onDown);
    window.addEventListener('keyup',   this._onUp);
  }

  _onDown(e) {
    switch (e.code) {
      case 'ArrowLeft':  case 'KeyA': this.actions.left  = true; e.preventDefault(); break;
      case 'ArrowRight': case 'KeyD': this.actions.right = true; e.preventDefault(); break;
      case 'Space': case 'ArrowUp': case 'KeyW':
        this.actions.fire = true; e.preventDefault(); break;
      case 'KeyP': case 'Escape':
        this.actions.pause = true; e.preventDefault(); break;
    }
  }

  _onUp(e) {
    switch (e.code) {
      case 'ArrowLeft':  case 'KeyA': this.actions.left  = false; break;
      case 'ArrowRight': case 'KeyD': this.actions.right = false; break;
      case 'Space': case 'ArrowUp': case 'KeyW':
        this.actions.fire = false; break;
      case 'KeyP': case 'Escape':
        this.actions.pause = false; break;
    }
  }

  destroy() {
    window.removeEventListener('keydown', this._onDown);
    window.removeEventListener('keyup',   this._onUp);
  }
}
