export class TouchInput {
  constructor(actions) {
    this.actions = actions;
    this._binds  = [];
    this._setup();
  }

  _bind(id, action) {
    const el = document.getElementById(id);
    if (!el) return;

    const start = (e) => { e.preventDefault(); this.actions[action] = true; };
    const end   = (e) => { e.preventDefault(); this.actions[action] = false; };

    el.addEventListener('touchstart', start, { passive: false });
    el.addEventListener('touchend',   end,   { passive: false });
    el.addEventListener('touchcancel',end,   { passive: false });

    this._binds.push({ el, start, end });
  }

  _setup() {
    this._bind('btn-left',  'left');
    this._bind('btn-right', 'right');
    this._bind('btn-fire',  'fire');
  }

  destroy() {
    for (const { el, start, end } of this._binds) {
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchend',   end);
      el.removeEventListener('touchcancel',end);
    }
    this._binds = [];
  }
}
