export const CANVAS_W = 800;
export const CANVAS_H = 600;

// Player
export const PLAYER_SPEED       = 220;   // px/sec
export const PLAYER_FIRE_COOLDOWN = 0.45; // seconds between shots
export const MAX_PLAYER_SHELLS  = 2;
export const PLAYER_Y           = 545;
export const LIVES_START        = 3;
export const PLAYER_RESPAWN_DELAY = 1.5; // seconds

// Enemies
export const ENEMY_COLS         = 8;
export const ENEMY_ROWS         = 4;
export const ENEMY_SPACING_X    = 72;
export const ENEMY_SPACING_Y    = 52;
export const ENEMY_FORMATION_TOP = 80;
export const ENEMY_DESCENT_PX   = 20;   // px to drop on edge hit
export const ENEMY_EDGE_MARGIN  = 30;   // px from canvas edge before turning
export const ENEMY_FIRE_INTERVAL_BASE = 1.2; // sec, per surviving enemy pick

// Shells
export const SHELL_SPEED_PLAYER = 480;  // px/sec
export const SHELL_SPEED_ENEMY  = 280;

// Bunkers
export const BUNKER_COUNT       = 4;
export const BUNKER_Y           = 460;
export const BUNKER_PIXEL_SIZE  = 4;    // each "pixel" is 4x4 CSS px
export const BUNKER_COLS        = 22;
export const BUNKER_ROWS        = 14;
export const BUNKER_CRATER_R    = 3;    // crater radius in bunker pixels

// Scoring
export const SCORE_LIGHT        = 10;
export const SCORE_MEDIUM       = 20;
export const SCORE_HEAVY        = 40;

// Colors
export const COLOR_BG           = '#0a0a0f';
export const COLOR_GRID         = 'rgba(0,60,0,0.06)';
export const COLOR_PLAYER_HULL  = '#4a5e2a';
export const COLOR_PLAYER_TREAD = '#2d3a18';
export const COLOR_PLAYER_TURRET = '#5a7234';
export const COLOR_PLAYER_BARREL = '#3a4a20';
export const COLOR_SHELL_PLAYER = '#ffe94d';
export const COLOR_SHELL_ENEMY  = '#ff6622';
export const COLOR_BUNKER       = '#2d6e1a';
export const COLOR_BUNKER_DARK  = '#1a4010';
export const COLOR_HUD_TEXT     = '#88cc44';
export const COLOR_HUD_DIM      = '#446622';

export const ENEMY_COLORS = {
  light:  { hull: '#5a6e8a', tread: '#3a4a5e', turret: '#6a7e9a', barrel: '#4a5e7a' },
  medium: { hull: '#7a6030', tread: '#4a3818', turret: '#8a7040', barrel: '#5a4820' },
  heavy:  { hull: '#7a2828', tread: '#4a1414', turret: '#9a3838', barrel: '#6a1c1c' },
};
