export type EnemyState = 'idle' | 'patrol' | 'aggro' | 'combat' | 'attacking' | 'staggered' | 'dead';

export type EnemyActionType = 'moving' | 'attacking' | 'recovering' | 'staggered';

export interface EnemyAction {
  type: EnemyActionType;
  name: string;
  windup?: number;
  active?: number;
  recovery?: number;
  damage?: number;
  range?: number;
}

export interface EnemyStats {
  hp: number;
  maxHp: number;
  poise: number;
  maxPoise: number;
}

export interface EnemyReward {
  xp: number;
  currency: number;
  drops: { itemId: string; chance: number; quantity: number }[];
}

export interface AttackTiming {
  windupMs: number;
  activeMs: number;
  recoveryMs: number;
}

export function createEnemyStats(maxHp: number, maxPoise: number): EnemyStats {
  return {
    hp: maxHp,
    maxHp,
    poise: maxPoise,
    maxPoise,
  };
}