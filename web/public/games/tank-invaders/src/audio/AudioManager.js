export class AudioManager {
  constructor() {
    this._ctx     = null;
    this._enabled = true;
    this._marchStep = 0;
    this._marchPitches = [110, 138, 165, 138];
  }

  _ctx_() {
    if (!this._ctx) {
      try { this._ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch { this._enabled = false; }
    }
    if (this._ctx?.state === 'suspended') this._ctx.resume();
    return this._ctx;
  }

  _osc(type, freq, duration, gain = 0.25, startFreq = null) {
    const ctx = this._ctx_();
    if (!ctx || !this._enabled) return;

    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.connect(g);
    g.connect(ctx.destination);

    osc.type = type;
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(startFreq ?? freq, now);
    if (startFreq != null) osc.frequency.exponentialRampToValueAtTime(freq, now + duration);

    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.start(now);
    osc.stop(now + duration);
  }

  _noise(duration, gain = 0.15) {
    const ctx = this._ctx_();
    if (!ctx || !this._enabled) return;

    const bufSize = ctx.sampleRate * duration;
    const buffer  = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data    = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    const g   = ctx.createGain();
    src.buffer = buffer;
    src.connect(g);
    g.connect(ctx.destination);

    const now = ctx.currentTime;
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);
    src.start(now);
  }

  shoot() {
    this._osc('triangle', 220, 0.09, 0.2, 880);
  }

  explosion() {
    this._noise(0.45, 0.3);
    this._osc('sawtooth', 60, 0.3, 0.15, 200);
  }

  playerHit() {
    this._osc('sawtooth', 110, 0.35, 0.25, 440);
    this._noise(0.2, 0.2);
  }

  march() {
    const pitch = this._marchPitches[this._marchStep % this._marchPitches.length];
    this._marchStep++;
    this._osc('square', pitch, 0.06, 0.1);
  }

  levelUp() {
    const notes = [523, 659, 784]; // C5 E5 G5
    const ctx   = this._ctx_();
    if (!ctx || !this._enabled) return;
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = 'triangle';
      const t = ctx.currentTime + i * 0.15;
      osc.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.start(t); osc.stop(t + 0.35);
    });
  }
}
