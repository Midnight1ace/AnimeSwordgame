import * as THREE from 'three';
import { InputManager } from '../input/Input';
import { WEAPON_DEFINITIONS, WeaponDefinition } from '../../shared/types/weapon';
import { DEFAULT_GAME_CONFIG } from '../../shared/types/config';
import { StaminaState, ComboState, CombatAction, createStaminaState } from './CombatTypes';

export class PlayerCombatController {
  private state: CombatAction = 'idle';
  private stamina: StaminaState;
  private combo: ComboState;
  private weapon: WeaponDefinition;
  private dodgeDirection: THREE.Vector3 = new THREE.Vector3();
  private dodgeTimer: number = 0;
  private parryTimer: number = 0;
  private parryActive: boolean = false;
  private hitTimer: number = 0;
  private staggerTimer: number = 0;
  private hitPause: boolean = false;
  private hitPauseTimer: number = 0;
  private input: InputManager;
  private config = DEFAULT_GAME_CONFIG.combat;

  constructor(input: InputManager, weaponId: string = 'katana') {
    this.input = input;
    this.weapon = WEAPON_DEFINITIONS[weaponId];
    this.stamina = createStaminaState(this.config.baseStamina);
    this.combo = {
      currentStep: 0,
      chainTimer: 0,
      inCancelWindow: false,
      animationProgress: 0,
    };
  }

  update(delta: number): void {
    if (this.hitPause) {
      this.hitPauseTimer -= delta * 1000;
      if (this.hitPauseTimer <= 0) {
        this.hitPause = false;
      }
      return;
    }

    this.updateStamina(delta);
    this.updateTimers(delta);

    if (this.state === 'hit') {
      if (this.hitTimer <= 0) {
        this.state = 'idle';
      }
      return;
    }

    if (this.state === 'stagger') {
      if (this.staggerTimer <= 0) {
        this.state = 'idle';
      }
      return;
    }

    if (this.state === 'dodge') {
      if (this.dodgeTimer <= 0) {
        this.state = 'idle';
      }
      return;
    }

    if (this.state === 'parry') {
      if (this.parryTimer <= 0) {
        this.parryActive = false;
        this.state = 'idle';
      }
      return;
    }

    if (this.input.isJustPressed('light_attack')) {
      this.attemptLightAttack();
    } else if (this.input.isJustPressed('heavy_attack')) {
      this.attemptHeavyAttack();
    } else if (this.input.isJustPressed('dodge')) {
      this.attemptDodge();
    } else if (this.input.isJustPressed('parry')) {
      this.attemptParry();
    }

    if (this.combo.chainTimer > 0) {
      this.combo.chainTimer -= delta * 1000;
      if (this.combo.chainTimer <= 0) {
        this.resetCombo();
      }
    }
  }

  private updateStamina(delta: number): void {
    if (this.stamina.regenDelay > 0) {
      this.stamina.regenDelay -= delta * 1000;
    } else if (this.stamina.current < this.stamina.max) {
      this.stamina.current = Math.min(
        this.stamina.max,
        this.stamina.current + this.config.staminaRegenRate * delta
      );
      this.stamina.isRecovering = true;
    }
  }

  private updateTimers(delta: number): void {
    if (this.hitTimer > 0) this.hitTimer -= delta * 1000;
    if (this.staggerTimer > 0) this.staggerTimer -= delta * 1000;
    if (this.dodgeTimer > 0) this.dodgeTimer -= delta * 1000;
    if (this.parryTimer > 0) this.parryTimer -= delta * 1000;
  }

  attemptLightAttack(): boolean {
    const staminaCost = this.weapon.staminaCosts[this.combo.currentStep] || this.config.lightAttackStaminaCost;
    if (this.stamina.current < staminaCost) return false;

    this.stamina.current -= staminaCost;
    this.stamina.regenDelay = 500;
    this.stamina.isRecovering = false;
    this.state = 'light_attack';
    this.combo.chainTimer = 500;
    return true;
  }

  attemptHeavyAttack(): boolean {
    const staminaCost = this.config.heavyAttackStaminaCost;
    if (this.stamina.current < staminaCost) return false;

    this.stamina.current -= staminaCost;
    this.stamina.regenDelay = 500;
    this.stamina.isRecovering = false;
    this.state = 'heavy_attack';
    this.combo.chainTimer = 600;
    return true;
  }

  attemptDodge(): boolean {
    if (this.stamina.current < this.config.dodgeStaminaCost) return false;
    if (this.state === 'dodge' || this.state === 'hit' || this.state === 'stagger') return false;

    const movement = this.input.getMovementAxis();
    if (movement.x === 0 && movement.z === 0) {
      this.dodgeDirection.set(0, 0, -1);
    } else {
      this.dodgeDirection.set(movement.x, 0, movement.z).normalize();
    }

    this.stamina.current -= this.config.dodgeStaminaCost;
    this.stamina.regenDelay = 500;
    this.stamina.isRecovering = false;
    this.state = 'dodge';
    this.dodgeTimer = 300;
    return true;
  }

  attemptParry(): boolean {
    if (this.stamina.current < this.config.parryStaminaCost) return false;
    if (this.state === 'parry' || this.state === 'hit' || this.state === 'stagger') return false;

    this.stamina.current -= this.config.parryStaminaCost;
    this.stamina.regenDelay = 500;
    this.state = 'parry';
    this.parryTimer = this.config.parryWindowMs;
    this.parryActive = true;
    return true;
  }

  getCurrentAttackStep(): number {
    return this.combo.currentStep;
  }

  advanceCombo(): void {
    if (this.combo.currentStep < this.weapon.comboChain.length - 1) {
      this.combo.currentStep++;
    } else {
      this.resetCombo();
    }
  }

  resetCombo(): void {
    this.combo.currentStep = 0;
    this.combo.chainTimer = 0;
  }

  takeDamage(_damage: number, _knockback: THREE.Vector3): void {
    if (this.state === 'dodge') return;
    
    if (this.parryActive) {
      return;
    }

    this.state = 'hit';
    this.hitTimer = 300;
    this.stamina.regenDelay = 1000;
  }

  stagger(duration: number): void {
    this.state = 'stagger';
    this.staggerTimer = duration;
  }

  triggerHitPause(duration: number): void {
    this.hitPause = true;
    this.hitPauseTimer = duration;
  }

  getState(): CombatAction {
    return this.state;
  }

  getStamina(): StaminaState {
    return this.stamina;
  }

  getDodgeDirection(): THREE.Vector3 {
    return this.dodgeDirection.clone();
  }

  isDodging(): boolean {
    return this.state === 'dodge';
  }

  isParrying(): boolean {
    return this.parryActive;
  }

  isAttacking(): boolean {
    return this.state === 'light_attack' || this.state === 'heavy_attack';
  }

  isStaggered(): boolean {
    return this.state === 'stagger';
  }

  isHit(): boolean {
    return this.state === 'hit';
  }

  canAct(): boolean {
    return this.state === 'idle';
  }

  setWeapon(weaponId: string): void {
    if (WEAPON_DEFINITIONS[weaponId]) {
      this.weapon = WEAPON_DEFINITIONS[weaponId];
      this.resetCombo();
    }
  }

  getWeapon(): WeaponDefinition {
    return this.weapon;
  }

  getHitbox(): { width: number; depth: number; offset: THREE.Vector3 } {
    const step = this.weapon.comboChain[this.combo.currentStep];
    return {
      width: step.hitbox.width,
      depth: step.hitbox.depth,
      offset: new THREE.Vector3(
        step.hitbox.offset.x,
        step.hitbox.offset.y,
        step.hitbox.offset.z
      ),
    };
  }

  getDamage(): number {
    const step = this.weapon.comboChain[this.combo.currentStep];
    return step?.damage || this.weapon.damage;
  }

  getPoiseDamage(): number {
    const step = this.weapon.comboChain[this.combo.currentStep];
    return step?.poiseDamage || 10;
  }

  getKnockback(): THREE.Vector3 {
    return new THREE.Vector3(0, 0, 3);
  }
}