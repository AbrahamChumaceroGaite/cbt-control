import { CANVAS_H } from '../constants.js';

export class CollisionSystem {
  /**
   * Run all collision checks for one frame.
   * Returns array of { type: 'enemyKilled'|'playerHit'|'shellHit', data }
   */
  check(player, formation, bunkers, shells, onEnemyKilled, onPlayerHit) {
    const living   = formation ? formation.alive : [];
    const toRemove = new Set();
    const events   = [];

    for (const shell of shells) {
      if (!shell.active || toRemove.has(shell)) continue;

      // Out of bounds
      if (shell.top > CANVAS_H || shell.bottom < 0) {
        shell.active = false;
        continue;
      }

      if (shell.owner === 'player') {
        // vs enemies
        for (const enemy of living) {
          if (!enemy.active) continue;
          if (shell.overlaps(enemy)) {
            enemy.active  = false;
            shell.active  = false;
            events.push({ type: 'enemyKilled', enemy });
            onEnemyKilled(enemy.type, enemy.x, enemy.y);
            break;
          }
        }
      }

      if (shell.owner === 'enemy' && !player.dead && player.invincible <= 0) {
        if (shell.overlaps(player)) {
          shell.active = false;
          events.push({ type: 'playerHit' });
          onPlayerHit(player.x, player.y);
        }
      }

      // vs bunkers (both directions)
      if (shell.active) {
        for (const b of bunkers) {
          if (b.handleShell(shell)) {
            shell.active = false;
            break;
          }
        }
      }
    }

    return events;
  }
}
