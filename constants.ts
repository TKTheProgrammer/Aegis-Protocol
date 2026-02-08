
export const WORLD_SIZE = 4000;
export const MECH_SPEED = 5;
export const PILOT_SPEED = 3; // Looks fast at 8x zoom
export const MECH_RADIUS = 40;
export const PILOT_RADIUS = 4; // Tiny!
export const KAIJU_HEAD_RADIUS = 50;
export const KAIJU_SEGMENT_RADIUS = 30;
export const KAIJU_SPEED = 3.5;
export const KAIJU_LENGTH = 12;
export const KAIJU_MAX_HEALTH = 10;

export const MECH_ZOOM = 0.8;
export const PILOT_ZOOM = 6.0; // 8x relative feels huge

export const CIVILIAN_COUNT = 50;
export const CIVILIAN_SPEED = 1.5;
export const CIVILIAN_FLEE_SPEED = 4.0;
export const CIVILIAN_RADIUS = 3;

export const BUILDING_HP = 50;
export const RUBBLE_HP = 30;
export const HAZARD_COUNT = 30;
export const HAZARD_RADIUS = 20;
export const EXPLOSION_RADIUS = 200;
export const EXPLOSION_DAMAGE = 25;

// Pilot Ability Constants
export const PILOT_STAMINA_MAX = 100;
export const PILOT_STAMINA_REGEN = 0.05; // Per ms roughly
export const DODGE_COST = 35;
export const DODGE_DURATION = 300; // ms
export const DODGE_COOLDOWN = 600; // ms
export const DODGE_SPEED_MULT = 2.8;

// Assist Constants
export const ASSIST_COOLDOWN_TIME = 15000; // 15 seconds
export const ASSIST_DURATION_NINJA = 4000;
export const ASSIST_DURATION_BRUTE = 3000;
export const ASSIST_DURATION_STRIKER = 2000;

export const COLORS = {
  MECH: '#00f3ff', // Cyan
  MECH_CORE: '#ffffff',
  PILOT: '#ff00ff', // Magenta
  CIVILIAN: '#00ffff', // Cyan-ish for survivors
  CIVILIAN_PANIC: '#ff00ff', // Panic color
  KAIJU_SKIN: '#1a1a1a',
  KAIJU_BLOOD: '#39ff14', // Neon Green
  KAIJU_GLOW: '#ff073a', // Neon Red
  WEAK_POINT: '#ffaa00', // Neon Orange
  CRIT_HIT: '#fffacd', // Lemon Chiffon (Bright flash)
  RESCUE_ZONE: '#ffd700', // Gold
  PROJECTILE: '#00f3ff',
  MELEE_ARC: '#ffaa00',
  BG_GRID: '#111111',
  BG_GRID_ACCENT: '#222222',
  BUILDING_DARK: '#0b0d12',
  BUILDING_LIGHT: '#11151c',
  BUILDING_RUBBLE: '#111111',
  SCORCH_MARK: '#080808',
  WINDOW_LIGHT: '#00ffcc',
  HAZARD: '#ff3300',
  EXPLOSION: '#ff8800',
  
  // Assist Colors
  ASSIST_NINJA: '#76ff03', // Lime
  ASSIST_BRUTE: '#ff3d00', // Deep Orange
  ASSIST_STRIKER: '#00e5ff' // Cyan Accent
};

export const FIRE_RATE = 150; // ms
export const MELEE_COOLDOWN = 600; // ms
