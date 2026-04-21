export interface BossDefinition {
  id: string;
  name: string;
  zoneId: string;
  stats: BossStats;
  phases: BossPhase[];
  introTrigger: TriggerConfig;
  outroTrigger: TriggerConfig;
  arenaRules: ArenaRules;
  checkpointBehavior: CheckpointBehavior;
}

export interface BossStats {
  baseHp: number;
  baseDamage: number;
  poise: number;
}

export interface BossPhase {
  phase: number;
  hpThreshold: number;
  moves: BossMove[];
  specialRules: PhaseSpecialRule[];
}

export interface BossMove {
  name: string;
  type: 'light' | 'heavy' | 'projectile' | 'grab' | 'special' | 'aoe';
  damage: number;
  range: number;
  windupMs: number;
  activeMs: number;
  recoveryMs: number;
  staminaCost: number;
  poiseDamage: number;
  animation: string;
}

export type PhaseSpecialRule = 'enrage' | 'add_spawns' | 'arena_change' | '免疫_break';

export interface TriggerConfig {
  type: 'dialogue' | 'proximity' | 'flag';
  config: string;
}

export interface ArenaRules {
  allowedAreas: { x: number; y: number; z: number; radius: number }[];
  resetOnExit: boolean;
  cameraMode: 'free' | 'lock' | 'boss_focus';
}

export interface CheckpointBehavior {
  grantOnEntry: boolean;
  grantOnDeath: boolean;
  respawnAtPhaseStart: boolean;
}

export const BOSS_DEFINITIONS: Record<string, BossDefinition> = {
  warden_kage: {
    id: 'warden_kage',
    name: 'Warden Kage',
    zoneId: 'forbidden_district',
    stats: {
      baseHp: 500,
      baseDamage: 50,
      poise: 150,
    },
    phases: [
      {
        phase: 1,
        hpThreshold: 0.7,
        moves: [
          {
            name: 'cleave',
            type: 'heavy',
            damage: 45,
            range: 3.0,
            windupMs: 600,
            activeMs: 400,
            recoveryMs: 800,
            staminaCost: 0,
            poiseDamage: 35,
            animation: 'boss_ground_slash',
          },
          {
            name: 'thrust',
            type: 'heavy',
            damage: 40,
            range: 4.0,
            windupMs: 500,
            activeMs: 300,
            recoveryMs: 600,
            staminaCost: 0,
            poiseDamage: 30,
            animation: 'boss_thrust',
          },
        ],
        specialRules: [],
      },
      {
        phase: 2,
        hpThreshold: 0.3,
        moves: [
          {
            name: 'rage_slash',
            type: 'heavy',
            damage: 55,
            range: 3.5,
            windupMs: 400,
            activeMs: 350,
            recoveryMs: 700,
            staminaCost: 0,
            poiseDamage: 40,
            animation: 'boss_rage_slash',
          },
          {
            name: 'sweeping_slash',
            type: 'aoe',
            damage: 50,
            range: 5.0,
            windupMs: 700,
            activeMs: 500,
            recoveryMs: 1000,
            staminaCost: 0,
            poiseDamage: 35,
            animation: 'boss_sweep',
          },
        ],
        specialRules: ['enrage'],
      },
    ],
    introTrigger: { type: 'dialogue', config: 'warden_intro' },
    outroTrigger: { type: 'flag', config: 'warden_defeated' },
    arenaRules: {
      allowedAreas: [{ x: 0, y: 0, z: 0, radius: 12 }],
      resetOnExit: true,
      cameraMode: 'boss_focus',
    },
    checkpointBehavior: {
      grantOnEntry: true,
      grantOnDeath: true,
      respawnAtPhaseStart: true,
    },
  },
};