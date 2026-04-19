import { CANVAS_W, CANVAS_H, BUNKER_COUNT, BUNKER_Y, BUNKER_COLS, BUNKER_PIXEL_SIZE, MAX_PLAYER_SHELLS, PLAYER_RESPAWN_DELAY } from './constants.js';
import { PlayerTank }      from './entities/PlayerTank.js';
import { EnemyFormation }  from './entities/EnemyFormation.js';
import { Bunker }          from './entities/Bunker.js';
import { Shell }           from './entities/Shell.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { ScoreSystem }     from './systems/ScoreSystem.js';
import { LevelSystem }     from './systems/LevelSystem.js';
import { Renderer }        from './rendering/Renderer.js';
import { InputManager }    from './input/InputManager.js';
import { AudioManager }    from './audio/AudioManager.js';

// States: TITLE | PLAYING | PAUSED | LEVEL_COMPLETE | GAME_OVER
export class Game {
  constructor(canvas) {
    this.renderer   = new Renderer(canvas);
    this.input      = new InputManager();
    this.audio      = new AudioManager();
    this.score      = new ScoreSystem();
    this.levelSys   = new LevelSystem();

    this.state     = 'TITLE';
    this.stateTime = 0;
    this.level     = 1;

    this.player    = new PlayerTank();
    this.formation = null;
    this.bunkers   = [];
    this.shells    = [];
    this.explosions = []; // {x, y, t (0→1), speed}
    this.collision  = new CollisionSystem();

    this._lastTime   = null;
    this._rafId      = null;
    this._respawnTimer = 0;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  start() {
    this._loop = this._loop.bind(this);
    this._rafId = requestAnimationFrame(this._loop);
  }

  stop() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
  }

  // ── Main Loop ──────────────────────────────────────────────────────────────

  _loop(ts) {
    const dt = this._lastTime === null ? 0 : Math.min((ts - this._lastTime) / 1000, 0.05);
    this._lastTime = ts;

    this._update(dt);
    this.renderer.draw(this);
    this._rafId = requestAnimationFrame(this._loop);
  }

  _update(dt) {
    this.stateTime += dt;

    // Update explosion particles
    this.explosions = this.explosions.filter(ex => {
      ex.t += ex.speed * dt;
      return ex.t < 1;
    });

    switch (this.state) {
      case 'TITLE':        return this._updateTitle(dt);
      case 'PLAYING':      return this._updatePlaying(dt);
      case 'PAUSED':       return this._updatePaused();
      case 'LEVEL_COMPLETE': return this._updateLevelComplete(dt);
      case 'GAME_OVER':    return this._updateGameOver();
    }
  }

  // ── State Updates ──────────────────────────────────────────────────────────

  _updateTitle() {
    if (this.input.consumeFire()) {
      this._startGame();
    }
    this.input.tick();
  }

  _updatePlaying(dt) {
    // Pause toggle
    if (this.input.consumePause()) {
      this.state = 'PAUSED';
      this.input.tick();
      return;
    }

    // Player respawn delay
    if (this._respawnTimer > 0) {
      this._respawnTimer -= dt;
      if (this._respawnTimer <= 0) {
        this.player.reset();
      }
    }

    // Player update
    const wantFire = this.player.update(dt, this.input.actions, this.shells, MAX_PLAYER_SHELLS);
    if (wantFire) {
      this.shells.push(new Shell(this.player.x, this.player.y - 26, 'player'));
      this.audio.shoot();
    }

    // Enemy formation update
    const fireOrigin = this.formation.update(dt);
    if (fireOrigin) {
      this.shells.push(new Shell(fireOrigin.x, fireOrigin.y, 'enemy'));
    }

    // Shell update
    for (const s of this.shells) s.update(dt);

    // Collision
    this.collision.check(
      this.player,
      this.formation,
      this.bunkers,
      this.shells,
      (type, x, y) => this._onEnemyKilled(type, x, y),
      (x, y)       => this._onPlayerHit(x, y),
    );

    // Prune dead shells
    this.shells = this.shells.filter(s => s.active);

    // Win condition
    if (this.formation.count === 0) {
      this._setState('LEVEL_COMPLETE');
      this.audio.levelUp();
      return;
    }

    // Lose condition: enemies reach player line or player out of lives
    if (this.formation.hasReachedPlayer() || this.player.lives <= 0) {
      this._setState('GAME_OVER');
      return;
    }

    this.input.tick();
  }

  _updatePaused() {
    if (this.input.consumePause() || this.input.consumeFire()) {
      this.state = 'PLAYING';
    }
    this.input.tick();
  }

  _updateLevelComplete(dt) {
    if (this.stateTime > 2.5) {
      this.level++;
      this.levelSys.next();
      this._startLevel();
    }
  }

  _updateGameOver() {
    if (this.input.consumeFire()) {
      this.score.reset();
      this.level = 1;
      this.levelSys.reset();
      this._startGame();
    }
    this.input.tick();
  }

  // ── Game Events ────────────────────────────────────────────────────────────

  _onEnemyKilled(type, x, y) {
    this.score.add(type);
    this.audio.explosion();
    this._addExplosion(x, y);
  }

  _onPlayerHit(x, y) {
    this.player.hit();
    this.audio.playerHit();
    this._addExplosion(x, y);
    if (!this.player.dead) {
      // Temporarily hide player during respawn flash
      this._respawnTimer = PLAYER_RESPAWN_DELAY;
    }
  }

  _addExplosion(x, y) {
    this.explosions.push({ x, y, t: 0, speed: 2.2 });
  }

  // ── Setup ─────────────────────────────────────────────────────────────────

  _startGame() {
    this.player = new PlayerTank();
    this.level  = 1;
    this.levelSys.reset();
    window.parent.postMessage({ type: 'SESSION_START' }, '*');
    this._startLevel();
  }

  _startLevel() {
    this.shells      = [];
    this.explosions  = [];
    this._respawnTimer = 0;

    this.formation = new EnemyFormation(this.level);
    this.formation.onMarch = () => this.audio.march();

    // Build 4 evenly spaced bunkers
    this.bunkers = [];
    const spacing = CANVAS_W / (BUNKER_COUNT + 1);
    const bw      = BUNKER_COLS * BUNKER_PIXEL_SIZE;
    for (let i = 0; i < BUNKER_COUNT; i++) {
      this.bunkers.push(new Bunker(
        Math.round(spacing * (i + 1) - bw / 2),
        BUNKER_Y,
      ));
    }

    this.player.invincible = 1.5;
    this.player.dead       = false;
    this._setState('PLAYING');
  }

  _setState(state) {
    this.state     = state;
    this.stateTime = 0;
    if (state === 'LEVEL_COMPLETE') {
      window.parent.postMessage(
        { type: 'LEVEL_COMPLETE', level: this.level, score: this.score.current },
        '*',
      );
    } else if (state === 'GAME_OVER') {
      window.parent.postMessage(
        { type: 'GAME_OVER', level: this.level, score: this.score.current },
        '*',
      );
    }
  }
}
