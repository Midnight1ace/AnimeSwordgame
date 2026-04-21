export interface GameConfig {
  camera: CameraConfig;
  combat: CombatConfig;
  difficulty: DifficultyConfig;
  debug: DebugConfig;
}

export interface CameraConfig {
  fov: number;
  near: number;
  far: number;
  explorationDistance: number;
  lockOnDistance: number;
  minHeight: number;
  maxHeight: number;
}

export interface CombatConfig {
  baseStamina: number;
  staminaRegenRate: number;
  lightAttackStaminaCost: number;
  heavyAttackStaminaCost: number;
  dodgeStaminaCost: number;
  parryStaminaCost: number;
  parryWindowMs: number;
  iFrameWindowMs: number;
  hitPauseDurationMs: number;
}

export interface DifficultyConfig {
  damageMultiplier: number;
  enemyHealthMultiplier: number;
  enemyDamageMultiplier: number;
}

export interface DebugConfig {
  enabled: boolean;
  showHitboxes: boolean;
  showAIState: boolean;
  showFPS: boolean;
  invulnerable: boolean;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  camera: {
    fov: 60,
    near: 0.1,
    far: 1000,
    explorationDistance: 8,
    lockOnDistance: 20,
    minHeight: 1.2,
    maxHeight: 3.5,
  },
  combat: {
    baseStamina: 100,
    staminaRegenRate: 25,
    lightAttackStaminaCost: 8,
    heavyAttackStaminaCost: 15,
    dodgeStaminaCost: 20,
    parryStaminaCost: 10,
    parryWindowMs: 200,
    iFrameWindowMs: 300,
    hitPauseDurationMs: 50,
  },
  difficulty: {
    damageMultiplier: 1.0,
    enemyHealthMultiplier: 1.0,
    enemyDamageMultiplier: 1.0,
  },
  debug: {
    enabled: false,
    showHitboxes: false,
    showAIState: false,
    showFPS: false,
    invulnerable: false,
  },
};