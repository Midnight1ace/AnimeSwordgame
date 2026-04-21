import * as THREE from 'three';
import { BossDefinition, BossMove as BossMoveData } from '../../shared/types/boss';
import { Damageable, Damager } from '../../engine/combat/CombatManager';
import { BossState } from './BossTypes';

export class BossBase implements Damageable, Damager {
  id: string;
  private definition: BossDefinition;
  private position: THREE.Vector3;
  private rotation: number = 0;
  private state: BossState = 'intro';
  private hp: number;
  private maxHp: number;
  private currentPhase: number = 0;
  private actionTimer: number = 0;
  private currentMove: BossMoveData | null = null;
  private hitStunTimer: number = 0;
  private poise: number;
  private introPlayed: boolean = false;
  private outroTriggered: boolean = false;
  private defeated: boolean = false;

  private onIntroEndCallback: (() => void) | null = null;
  private onPhaseChangeCallback: ((phase: number) => void) | null = null;
  private onVictoryCallback: (() => void) | null = null;
  private onDefeatCallback: (() => void) | null = null;

  constructor(id: string, definition: BossDefinition, position: THREE.Vector3) {
    this.id = id;
    this.definition = definition;
    this.position = position.clone();
    this.maxHp = definition.stats.baseHp;
    this.hp = this.maxHp;
    this.poise = definition.stats.poise;
  }

  update(delta: number, playerPosition: THREE.Vector3): void {
    if (this.defeated) return;

    if (this.hitStunTimer > 0) {
      this.hitStunTimer -= delta * 1000;
      return;
    }

    switch (this.state) {
      case 'intro':
        this.updateIntro(delta);
        break;
      case 'idle':
        this.updateIdle(delta, playerPosition);
        break;
      case 'attacking':
        this.updateAttacking(delta, playerPosition);
        break;
      case 'recovery':
        this.updateRecovery(delta);
        break;
      case 'staggered':
        this.updateStaggered(delta);
        break;
      case 'victory':
        this.updateVictory(delta);
        break;
    }

    this.checkPhaseTransition();
  }

  private updateIntro(_delta: number): void {
    if (!this.introPlayed) {
      this.introPlayed = true;
      if (this.onIntroEndCallback) {
        this.onIntroEndCallback();
      }
    }
    this.state = 'idle';
  }

  private updateIdle(delta: number, playerPosition: THREE.Vector3): void {
    const direction = playerPosition.clone().sub(this.position);
    direction.y = 0;
    const dist = direction.length();
    direction.normalize();

    this.rotation = Math.atan2(direction.x, direction.z);

    if (dist > 3) {
      const moveSpeed = this.definition.stats.baseDamage * 0.1 * delta;
      this.position.add(direction.multiplyScalar(moveSpeed));
    }

    this.actionTimer -= delta * 1000;
    if (this.actionTimer <= 0) {
      this.selectAndExecuteMove();
    }
  }

  private selectAndExecuteMove(): void {
    const phase = this.definition.phases[this.currentPhase];
    if (!phase || phase.moves.length === 0) return;

    const move = phase.moves[Math.floor(Math.random() * phase.moves.length)];
    this.currentMove = move;
    this.actionTimer = move.windupMs;
    this.state = 'attacking';
  }

  private updateAttacking(delta: number, _playerPosition: THREE.Vector3): void {
    if (!this.currentMove) {
      this.state = 'idle';
      this.actionTimer = 500;
      return;
    }

    this.actionTimer -= delta * 1000;

    if (this.currentMove.windupMs > 0 && this.actionTimer <= this.currentMove.activeMs) {
    }

    if (this.actionTimer <= 0) {
      this.state = 'recovery';
      this.actionTimer = this.currentMove.recoveryMs;
      this.currentMove = null;
    }
  }

  private updateRecovery(delta: number): void {
    this.actionTimer -= delta * 1000;
    if (this.actionTimer <= 0) {
      this.state = 'idle';
      this.actionTimer = 500 + Math.random() * 1000;
    }
  }

  private updateStaggered(_delta: number): void {
    if (this.poise > 0) {
      this.state = 'idle';
    }
  }

  private updateVictory(_delta: number): void {
    if (!this.outroTriggered) {
      this.outroTriggered = true;
      if (this.onVictoryCallback) {
        this.onVictoryCallback();
      }
    }
  }

  private checkPhaseTransition(): void {
    const hpPercent = this.hp / this.maxHp;
    const phaseData = this.definition.phases[this.currentPhase];
    
    if (!phaseData) return;
    
    if (hpPercent <= phaseData.hpThreshold && this.currentPhase < this.definition.phases.length - 1) {
      this.currentPhase++;
      
      if (this.onPhaseChangeCallback) {
        this.onPhaseChangeCallback(this.currentPhase);
      }

      for (const rule of phaseData.specialRules) {
        if (rule === 'enrage') {
        }
      }
    }
  }

  takeDamage(damage: number, poiseDamage: number, knockback: THREE.Vector3, _sourceId: string): void {
    this.hp -= damage;
    this.poise -= poiseDamage;
    this.hitStunTimer = 200;

    if (this.poise <= 0) {
      this.state = 'staggered';
    }

    if (knockback.length() > 0) {
      const knockDir = knockback.clone().normalize();
      this.position.add(knockDir.multiplyScalar(0.5));
    }

    if (this.hp <= 0) {
      this.die();
    }
  }

  private die(): void {
    this.defeated = true;
    this.state = 'victory';
    
    if (this.onDefeatCallback) {
      this.onDefeatCallback();
    }
  }

  isAlive(): boolean {
    return this.hp > 0 && !this.defeated;
  }

  getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  getRotation(): number {
    return this.rotation;
  }

  getHp(): number {
    return this.hp;
  }

  getMaxHp(): number {
    return this.maxHp;
  }

  getPhase(): number {
    return this.currentPhase;
  }

  getState(): BossState {
    return this.state;
  }

  getDamage(): number {
    return this.currentMove?.damage ?? this.definition.stats.baseDamage;
  }

  getPoiseDamage(): number {
    return 25;
  }

  getKnockback(): THREE.Vector3 {
    return new THREE.Vector3(0, 0, 4);
  }

  getAttackType(): 'light' | 'heavy' | 'special' {
    return this.currentMove?.type === 'heavy' ? 'heavy' : 'light';
  }

  onIntroEnd(callback: () => void): void {
    this.onIntroEndCallback = callback;
  }

  onPhaseChange(callback: (phase: number) => void): void {
    this.onPhaseChangeCallback = callback;
  }

  onVictory(callback: () => void): void {
    this.onVictoryCallback = callback;
  }

  onDefeat(callback: () => void): void {
    this.onDefeatCallback = callback;
  }
}