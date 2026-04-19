import { Game } from './Game.js';

const canvas = document.getElementById('game-canvas');
const game   = new Game(canvas);

game.start();

// Expose stop handle for React/Next.js cleanup
window.__tankInvadersStop = () => game.stop();
