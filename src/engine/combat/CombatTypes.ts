import { Vector3 } from 'three';

export type CombatAction = 'idle' | 'light_attack' | 'heavy_attack' | 'dodge' | 'parry' | 'hit' | 'stagger' | 'death';

export interface ComboState {
  currentStep: number;
  chainTimer: number;
  inCancelWindow: boolean;
  animationProgress: number;
}

export interface StaminaState {
  current: number;
  max: number;
  regenDelay: number;
  isRecovering: boolean;
}

export interface HitEvent {
  attacker: string;
  target: string;
  damage: number;
  position: Vector3;
  type: 'light' | 'heavy' | 'special';
  poiseDamage: number;
  knockback: Vector3;
}

export interface Hitbox {
  width: number;
  height: number;
  depth: number;
  offset: Vector3;
  active: boolean;
  hitEntities: Set<string>;
}

export interface ParryWindow {
  startTime: number;
  endTime: number;
  active: boolean;
}

export interface IFrames {
  startTime: number;
  duration: number;
  active: boolean;
}

export function createStaminaState(max: number): StaminaState {
  return {
    current: max,
    max,
    regenDelay: 0,
    isRecovering: true,
  };
}

export function createHitbox(width: number, height: number, depth: number, offset: Vector3): Hitbox {
  return {
    width,
    height,
    depth,
    offset,
    active: false,
    hitEntities: new Set(),
  };
}