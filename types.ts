
export interface Vector2 {
  x: number;
  y: number;
}

export enum ParticleType {
  NORMAL = 'NORMAL',
  SHOCKWAVE = 'SHOCKWAVE',
  SPARK = 'SPARK',
  SMOKE = 'SMOKE',
  DEBRIS = 'DEBRIS'
}

export interface Particle {
  id: number;
  pos: Vector2;
  vel: Vector2;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: ParticleType;
  rotation: number;
  rotSpeed: number;
  damping: number;
}

export interface Entity {
  pos: Vector2;
  radius: number;
  active: boolean;
}

export enum KaijuType {
  GODZILLA = 'GODZILLA', // Tanky, slow, spikes
  KONG = 'KONG',         // Fast, brawler, no tail
  WYVERN = 'WYVERN',     // Flying, fast, weak
}

export interface KaijuHead extends Entity {
  type: KaijuType;
  health: number;
  maxHealth: number;
  isWeakPoint: boolean;
  weakPointTimer: number;
  stunTimer: number;
}

export interface KaijuSegment extends Entity {
  id: number;
  isWeakPoint: boolean;
}

export interface Civilian extends Entity {
  id: number;
  velocity: Vector2;
  isFleeing: boolean;
  isTrapped: boolean; // Requires Pilot to rescue
}

export interface Building {
  id: number;
  pos: Vector2;
  width: number;
  height: number;
  color: string;
  hasLights: boolean;
  health: number;
  maxHealth: number;
  isDestroyed: boolean;
  rubbleHealth: number;
  isRubbleDestroyed: boolean;
}

export interface Hazard extends Entity {
  id: number;
  health: number;
  pulseOffset: number;
}

export enum PlayerMode {
  MECH = 'MECH',
  PILOT = 'PILOT',
}

export interface Projectile extends Entity {
  id: number;
  vel: Vector2;
  life: number;
  color: string;
}

// --- NEW ASSIST TYPES ---
export enum AssistType {
  NINJA = 'NINJA',
  BRUTE = 'BRUTE',
  STRIKER = 'STRIKER'
}

export interface AssistUnit {
  type: AssistType;
  pos: Vector2;
  timer: number;
  maxTimer: number;
  state: 'ENTRY' | 'ACTION' | 'EXIT';
  target?: Vector2;
}

export interface GameState {
  playerMode: PlayerMode;
  mechPos: Vector2;
  pilotPos: Vector2; // Relative to world, not mech
  mechHealth: number;
  pilotHealth: number;
  pilotStamina: number; // New: Stamina for dodging
  score: number;
  rescuedCount: number;
  kaijuHead: KaijuHead;
  kaijuSegments: KaijuSegment[];
  buildings: Building[];
  hazards: Hazard[];
  particles: Particle[];
  projectiles: Projectile[];
  civilians: Civilian[];
  camera: {
    pos: Vector2;
    zoom: number;
    targetZoom: number;
    shake: number;
  };
  mousePos: Vector2; // Screen space
  isFiring: boolean;
  isMelee: boolean;
  meleeAnimFrame: number; // 0 to 10 for sword swing animation
  lastShotTime: number;
  lastMeleeTime: number;
  lastEjectTime: number; // For ejection animation
  
  // Dodge Logic
  isDodging: boolean;
  dodgeTimer: number;
  dodgeDir: Vector2;
  lastDodgeTime: number;

  // Audio Logic
  lastStepTime: number;

  // Assist Logic
  activeAssist: AssistUnit | null;
  assistCooldowns: { [key in AssistType]: number }; // value is timestamp when available

  gameOver: boolean;
}
