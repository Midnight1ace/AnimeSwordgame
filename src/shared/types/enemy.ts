export interface EnemyDefinition {
  id: string;
  name: string;
  archetype: EnemyArchetype;
  stats: EnemyStats;
  aggroRange: number;
  moveList: EnemyMove[];
  reactionRules: ReactionRules;
  rewardTable: RewardTable;
}

export type EnemyArchetype =
  | 'grunt'
  | 'warrior'
  | 'ranged'
  | 'speedster'
  | 'tank'
  | 'caster'
  | 'elite'
  | 'miniboss';

export interface EnemyStats {
  hp: number;
  damage: number;
  poise: number;
  stance: StanceType;
  moveSpeed: number;
  attackSpeed: number;
}

export type StanceType = 'aggressive' | 'cautious' | 'defensive';

export interface EnemyMove {
  name: string;
  type: MoveType;
  damage: number;
  range: number;
  windupMs: number;
  activeMs: number;
  recoveryMs: number;
  staminaCost: number;
  poiseDamage: number;
  animation: string;
}

export type MoveType = 'light' | 'heavy' | 'projectile' | 'grab' | 'special';

export interface ReactionRules {
  hitStunMs: number;
  parryWindowMs: number;
  counterable: boolean;
  poiseRecoveryMs: number;
}

export interface RewardTable {
  xp: number;
  currency: number;
  drops: RewardDrop[];
}

export interface RewardDrop {
  itemId: string;
  chance: number;
  quantity: number;
}

export const ENEMY_DEFINITIONS: Record<string, EnemyDefinition> = {
  human_grunt: {
    id: 'human_grunt',
    name: 'Cursed Soldier',
    archetype: 'grunt',
    stats: {
      hp: 50,
      damage: 15,
      poise: 20,
      stance: 'aggressive',
      moveSpeed: 3.5,
      attackSpeed: 1.0,
    },
    aggroRange: 15,
    moveList: [
      {
        name: 'slash',
        type: 'light',
        damage: 15,
        range: 1.5,
        windupMs: 300,
        activeMs: 200,
        recoveryMs: 400,
        staminaCost: 0,
        poiseDamage: 10,
        animation: 'grunt_slash',
      },
    ],
    reactionRules: {
      hitStunMs: 300,
      parryWindowMs: 150,
      counterable: true,
      poiseRecoveryMs: 1000,
    },
    rewardTable: {
      xp: 25,
      currency: 10,
      drops: [],
    },
  },
  human_warrior: {
    id: 'human_warrior',
    name: 'Blade Veteran',
    archetype: 'warrior',
    stats: {
      hp: 80,
      damage: 25,
      poise: 40,
      stance: 'aggressive',
      moveSpeed: 3.2,
      attackSpeed: 0.9,
    },
    aggroRange: 18,
    moveList: [
      {
        name: 'combo',
        type: 'light',
        damage: 25,
        range: 1.8,
        windupMs: 250,
        activeMs: 300,
        recoveryMs: 500,
        staminaCost: 0,
        poiseDamage: 15,
        animation: 'warrior_combo',
      },
      {
        name: 'thrust',
        type: 'heavy',
        damage: 35,
        range: 2.2,
        windupMs: 400,
        activeMs: 250,
        recoveryMs: 600,
        staminaCost: 0,
        poiseDamage: 20,
        animation: 'warrior_thrust',
      },
    ],
    reactionRules: {
      hitStunMs: 400,
      parryWindowMs: 200,
      counterable: true,
      poiseRecoveryMs: 1500,
    },
    rewardTable: {
      xp: 50,
      currency: 25,
      drops: [{ itemId: 'iron_shard', chance: 0.3, quantity: 1 }],
    },
  },
  speedster: {
    id: 'speedster',
    name: 'Shadow Runner',
    archetype: 'speedster',
    stats: {
      hp: 40,
      damage: 20,
      poise: 15,
      stance: 'cautious',
      moveSpeed: 5.5,
      attackSpeed: 1.8,
    },
    aggroRange: 20,
    moveList: [
      {
        name: 'dash_strike',
        type: 'light',
        damage: 20,
        range: 2.0,
        windupMs: 150,
        activeMs: 100,
        recoveryMs: 300,
        staminaCost: 0,
        poiseDamage: 12,
        animation: 'speedster_dash',
      },
    ],
    reactionRules: {
      hitStunMs: 200,
      parryWindowMs: 100,
      counterable: false,
      poiseRecoveryMs: 800,
    },
    rewardTable: {
      xp: 40,
      currency: 20,
      drops: [{ itemId: 'swift_feather', chance: 0.2, quantity: 1 }],
    },
  },
  tank: {
    id: 'tank',
    name: 'Heavyset',
    archetype: 'tank',
    stats: {
      hp: 150,
      damage: 30,
      poise: 80,
      stance: 'defensive',
      moveSpeed: 2.0,
      attackSpeed: 0.5,
    },
    aggroRange: 12,
    moveList: [
      {
        name: 'shield_bash',
        type: 'heavy',
        damage: 30,
        range: 1.5,
        windupMs: 500,
        activeMs: 300,
        recoveryMs: 800,
        staminaCost: 0,
        poiseDamage: 25,
        animation: 'tank_bash',
      },
    ],
    reactionRules: {
      hitStunMs: 600,
      parryWindowMs: 300,
      counterable: true,
      poiseRecoveryMs: 2500,
    },
    rewardTable: {
      xp: 75,
      currency: 40,
      drops: [{ itemId: 'steel_ingot', chance: 0.4, quantity: 1 }],
    },
  },
  caster: {
    id: 'caster',
    name: 'Corrupted Mage',
    archetype: 'caster',
    stats: {
      hp: 45,
      damage: 35,
      poise: 15,
      stance: 'cautious',
      moveSpeed: 2.8,
      attackSpeed: 0.6,
    },
    aggroRange: 25,
    moveList: [
      {
        name: 'fireball',
        type: 'projectile',
        damage: 35,
        range: 15,
        windupMs: 800,
        activeMs: 500,
        recoveryMs: 1000,
        staminaCost: 0,
        poiseDamage: 15,
        animation: 'caster_fireball',
      },
    ],
    reactionRules: {
      hitStunMs: 250,
      parryWindowMs: 120,
      counterable: false,
      poiseRecoveryMs: 700,
    },
    rewardTable: {
      xp: 60,
      currency: 35,
      drops: [{ itemId: 'arcane_shard', chance: 0.3, quantity: 1 }],
    },
  },
  ranged: {
    id: 'ranged',
    name: 'Bowman',
    archetype: 'ranged',
    stats: {
      hp: 40,
      damage: 25,
      poise: 15,
      stance: 'cautious',
      moveSpeed: 3.0,
      attackSpeed: 0.7,
    },
    aggroRange: 25,
    moveList: [
      {
        name: 'arrow',
        type: 'projectile',
        damage: 25,
        range: 20,
        windupMs: 600,
        activeMs: 300,
        recoveryMs: 800,
        staminaCost: 0,
        poiseDamage: 10,
        animation: 'ranged_arrow',
      },
    ],
    reactionRules: {
      hitStunMs: 250,
      parryWindowMs: 120,
      counterable: false,
      poiseRecoveryMs: 800,
    },
    rewardTable: {
      xp: 35,
      currency: 20,
      drops: [],
    },
  },
  elite_warrior: {
    id: 'elite_warrior',
    name: 'Blade Master',
    archetype: 'elite',
    stats: {
      hp: 120,
      damage: 40,
      poise: 60,
      stance: 'aggressive',
      moveSpeed: 3.5,
      attackSpeed: 1.1,
    },
    aggroRange: 18,
    moveList: [
      {
        name: 'rapid_slash',
        type: 'light',
        damage: 30,
        range: 2.0,
        windupMs: 200,
        activeMs: 250,
        recoveryMs: 400,
        staminaCost: 0,
        poiseDamage: 20,
        animation: 'elite_rapid',
      },
      {
        name: 'spinning_strike',
        type: 'heavy',
        damage: 50,
        range: 2.5,
        windupMs: 400,
        activeMs: 300,
        recoveryMs: 700,
        staminaCost: 0,
        poiseDamage: 30,
        animation: 'elite_spin',
      },
    ],
    reactionRules: {
      hitStunMs: 500,
      parryWindowMs: 250,
      counterable: true,
      poiseRecoveryMs: 2000,
    },
    rewardTable: {
      xp: 100,
      currency: 60,
      drops: [{ itemId: 'steel_ingot', chance: 0.5, quantity: 2 }],
    },
  },
  miniboss_template: {
    id: 'miniboss_template',
    name: 'Zone Guardian',
    archetype: 'miniboss',
    stats: {
      hp: 200,
      damage: 45,
      poise: 100,
      stance: 'defensive',
      moveSpeed: 3.0,
      attackSpeed: 0.8,
    },
    aggroRange: 15,
    moveList: [
      {
        name: 'heavy_slash',
        type: 'heavy',
        damage: 45,
        range: 2.2,
        windupMs: 400,
        activeMs: 350,
        recoveryMs: 600,
        staminaCost: 0,
        poiseDamage: 30,
        animation: 'miniboss_slash',
      },
      {
        name: 'sweep',
        type: 'heavy',
        damage: 35,
        range: 3.0,
        windupMs: 500,
        activeMs: 400,
        recoveryMs: 800,
        staminaCost: 0,
        poiseDamage: 25,
        animation: 'miniboss_sweep',
      },
    ],
    reactionRules: {
      hitStunMs: 700,
      parryWindowMs: 350,
      counterable: true,
      poiseRecoveryMs: 3000,
    },
    rewardTable: {
      xp: 200,
      currency: 150,
      drops: [{ itemId: 'bloodystone', chance: 1.0, quantity: 1 }],
    },
  },
};