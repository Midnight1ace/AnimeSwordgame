export interface WeaponDefinition {
  id: string;
  name: string;
  style: WeaponStyle;
  comboChain: AttackStep[];
  damage: number;
  stagger: number;
  range: number;
  staminaCosts: number[];
  upgradePath: WeaponUpgrade[];
}

export type WeaponStyle = 'katana' | 'dual_blades' | 'greatsword';

export interface AttackStep {
  type: AttackType;
  damage: number;
  staminaCost: number;
  cancelWindow: CancelWindow;
  animation: string;
  hitbox: HitboxConfig;
  poiseDamage: number;
}

export type AttackType = 'light' | 'heavy' | 'finisher';

export interface CancelWindow {
  startMs: number;
  endMs: number;
}

export interface HitboxConfig {
  width: number;
  height: number;
  depth: number;
  offset: Vector3;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface WeaponUpgrade {
  tier: number;
  damageBonus: number;
  staminaCostReduction: number;
  materialId: string;
  materialCount: number;
}

export const WEAPON_DEFINITIONS: Record<string, WeaponDefinition> = {
  katana: {
    id: 'katana',
    name: 'Katana',
    style: 'katana',
    comboChain: [
      {
        type: 'light',
        damage: 25,
        staminaCost: 8,
        cancelWindow: { startMs: 200, endMs: 400 },
        animation: 'katana_light_1',
        hitbox: { width: 1.2, height: 0.5, depth: 1.5, offset: { x: 0, y: 0, z: 0.8 } },
        poiseDamage: 10,
      },
      {
        type: 'light',
        damage: 25,
        staminaCost: 8,
        cancelWindow: { startMs: 200, endMs: 400 },
        animation: 'katana_light_2',
        hitbox: { width: 1.2, height: 0.5, depth: 1.5, offset: { x: 0, y: 0, z: 0.8 } },
        poiseDamage: 10,
      },
      {
        type: 'light',
        damage: 35,
        staminaCost: 10,
        cancelWindow: { startMs: 250, endMs: 450 },
        animation: 'katana_light_3',
        hitbox: { width: 1.5, height: 0.5, depth: 2.0, offset: { x: 0, y: 0, z: 1.0 } },
        poiseDamage: 15,
      },
    ],
    damage: 25,
    stagger: 10,
    range: 1.5,
    staminaCosts: [8, 8, 10],
    upgradePath: [
      { tier: 1, damageBonus: 5, staminaCostReduction: 0, materialId: 'iron_shard', materialCount: 3 },
      { tier: 2, damageBonus: 10, staminaCostReduction: 1, materialId: 'steel_ingot', materialCount: 5 },
    ],
  },
  dual_blades: {
    id: 'dual_blades',
    name: 'Dual Blades',
    style: 'dual_blades',
    comboChain: [
      {
        type: 'light',
        damage: 20,
        staminaCost: 6,
        cancelWindow: { startMs: 150, endMs: 350 },
        animation: 'dual_leftSlash',
        hitbox: { width: 1.0, height: 0.4, depth: 1.2, offset: { x: 0, y: 0, z: 0.6 } },
        poiseDamage: 8,
      },
      {
        type: 'light',
        damage: 20,
        staminaCost: 6,
        cancelWindow: { startMs: 150, endMs: 350 },
        animation: 'dual_rightSlash',
        hitbox: { width: 1.0, height: 0.4, depth: 1.2, offset: { x: 0, y: 0, z: 0.6 } },
        poiseDamage: 8,
      },
      {
        type: 'finisher',
        damage: 40,
        staminaCost: 12,
        cancelWindow: { startMs: 300, endMs: 500 },
        animation: 'dual_spin',
        hitbox: { width: 2.0, height: 0.6, depth: 2.0, offset: { x: 0, y: 0, z: 1.0 } },
        poiseDamage: 20,
      },
    ],
    damage: 20,
    stagger: 8,
    range: 1.2,
    staminaCosts: [6, 6, 12],
    upgradePath: [
      { tier: 1, damageBonus: 4, staminaCostReduction: 0, materialId: 'iron_shard', materialCount: 3 },
      { tier: 2, damageBonus: 8, staminaCostReduction: 1, materialId: 'steel_ingot', materialCount: 5 },
    ],
  },
  greatsword: {
    id: 'greatsword',
    name: 'Greatsword',
    style: 'greatsword',
    comboChain: [
      {
        type: 'heavy',
        damage: 45,
        staminaCost: 15,
        cancelWindow: { startMs: 400, endMs: 600 },
        animation: 'gs_heavy_1',
        hitbox: { width: 2.0, height: 0.8, depth: 2.5, offset: { x: 0, y: 0, z: 1.2 } },
        poiseDamage: 25,
      },
      {
        type: 'heavy',
        damage: 50,
        staminaCost: 18,
        cancelWindow: { startMs: 450, endMs: 650 },
        animation: 'gs_heavy_2',
        hitbox: { width: 2.5, height: 0.8, depth: 3.0, offset: { x: 0, y: 0, z: 1.5 } },
        poiseDamage: 30,
      },
    ],
    damage: 45,
    stagger: 25,
    range: 2.0,
    staminaCosts: [15, 18],
    upgradePath: [
      { tier: 1, damageBonus: 10, staminaCostReduction: 0, materialId: 'iron_shard', materialCount: 5 },
      { tier: 2, damageBonus: 15, staminaCostReduction: 2, materialId: 'steel_ingot', materialCount: 8 },
    ],
  },
};