export type BossState = 'intro' | 'idle' | 'attacking' | 'recovery' | 'staggered' | 'victory' | 'dead';

export interface BossPhase {
  phase: number;
  hpThreshold: number;
  active: boolean;
}

export interface BossMove {
  name: string;
  type: 'light' | 'heavy' | 'projectile' | 'aoe' | 'special';
  damage: number;
  range: number;
  windupMs: number;
  activeMs: number;
  recoveryMs: number;
  tracking?: boolean;
}

export function createBossPhase(phase: number, hpThreshold: number): BossPhase {
  return {
    phase,
    hpThreshold,
    active: phase === 1,
  };
}