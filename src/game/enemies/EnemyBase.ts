import * as THREE from 'three';
import { EnemyDefinition } from '../../shared/types/enemy';
import { Damageable, Damager } from '../../engine/combat/CombatManager';
import { EnemyState, EnemyAction } from './EnemyTypes';

export class EnemyBase implements Damageable, Damager {
  id: string;
  private definition: EnemyDefinition;
  private position: THREE.Vector3;
  private rotation: number = 0;
  private state: EnemyState = 'idle';
  
  private hp: number;
  private poise: number;
  private currentAction: EnemyAction | null = null;
  private actionTimer: number = 0;
  private wanderTarget: THREE.Vector3 | null = null;

  private hitStunTimer: number = 0;
  private poiseRecoveryTimer: number = 0;

  private onDeathCallback: ((id: string) => void) | null = null;

  constructor(id: string, definition: EnemyDefinition, position: THREE.Vector3) {
    this.id = id;
    this.definition = definition;
    this.position = position.clone();
    this.hp = definition.stats.hp;
    this.poise = definition.stats.poise;
  }

  update(delta: number, playerPosition: THREE.Vector3): void {
    if (this.hitStunTimer > 0) {
      this.hitStunTimer -= delta * 1000;
      if (this.hitStunTimer <= 0 && this.poise <= 0) {
        this.poise = this.definition.stats.poise;
        this.state = 'idle';
      }
      return;
    }

    if (this.poiseRecoveryTimer > 0) {
      this.poiseRecoveryTimer -= delta * 1000;
      if (this.poiseRecoveryTimer <= 0) {
        this.poise = Math.min(
          this.definition.stats.poise,
          this.poise + 10
        );
      }
    }

    if (this.actionTimer > 0) {
      this.actionTimer -= delta * 1000;
      if (this.actionTimer <= 0) {
        this.currentAction = null;
        this.state = 'idle';
      }
      return;
    }

    const distToPlayer = this.position.distanceTo(playerPosition);

    if (distToPlayer <= this.definition.aggroRange) {
      this.state = 'combat';
    }

    switch (this.state) {
      case 'idle':
        this.updateIdle(delta, playerPosition);
        break;
      case 'patrol':
        this.updatePatrol(delta);
        break;
      case 'combat':
        this.updateCombat(delta, playerPosition);
        break;
      case 'staggered':
        this.updateStaggered(delta);
        break;
    }
  }

  private updateIdle(_delta: number, playerPosition: THREE.Vector3): void {
    const dist = this.position.distanceTo(playerPosition);
    
    if (dist < this.definition.aggroRange) {
      this.state = 'combat';
      return;
    }

    if (Math.random() < 0.02) {
      this.state = 'patrol';
      const angle = Math.random() * Math.PI * 2;
      const dist = 2 + Math.random() * 5;
      this.wanderTarget = new THREE.Vector3(
        this.position.x + Math.cos(angle) * dist,
        this.position.y,
        this.position.z + Math.sin(angle) * dist
      );
    }
  }

  private updatePatrol(delta: number): void {
    if (!this.wanderTarget) {
      this.state = 'idle';
      return;
    }

    const direction = this.wanderTarget.clone().sub(this.position);
    direction.y = 0;
    const dist = direction.length();

    if (dist < 0.5) {
      this.wanderTarget = null;
      this.state = 'idle';
      return;
    }

    direction.normalize();
    this.rotation = Math.atan2(direction.x, direction.z);
    const moveSpeed = this.definition.stats.moveSpeed * delta;
    this.position.add(direction.multiplyScalar(moveSpeed));
  }

  private updateCombat(delta: number, playerPosition: THREE.Vector3): void {
    const direction = playerPosition.clone().sub(this.position);
    direction.y = 0;
    const dist = direction.length();
    direction.normalize();

    this.rotation = Math.atan2(direction.x, direction.z);

    const attackRange = this.definition.moveList[0]?.range || 2;

    if (dist > attackRange + 1) {
      const moveSpeed = this.definition.stats.moveSpeed * delta;
      this.position.add(direction.multiplyScalar(moveSpeed));
      this.currentAction = { type: 'moving', name: 'chase' };
    } else if (!this.currentAction && Math.random() < 0.05) {
      const move = this.definition.moveList[
        Math.floor(Math.random() * this.definition.moveList.length)
      ];
      this.currentAction = {
        type: 'attacking',
        name: move.name,
        windup: move.windupMs,
        active: move.activeMs,
        recovery: move.recoveryMs,
        damage: move.damage,
        range: move.range,
      };
      this.actionTimer = move.windupMs + move.activeMs + move.recoveryMs;
    }
  }

  private updateStaggered(_delta: number): void {
    if (this.poise > 0) {
      this.state = 'idle';
    }
  }

  takeDamage(damage: number, poiseDamage: number, knockback: THREE.Vector3, _sourceId: string): void {
    this.hp -= damage;
    this.poise -= poiseDamage;
    this.hitStunTimer = this.definition.reactionRules.hitStunMs;
    this.poiseRecoveryTimer = this.definition.reactionRules.poiseRecoveryMs;

    if (this.poise <= 0) {
      this.state = 'staggered';
    }

    if (knockback.length() > 0) {
      const knockDir = knockback.clone().normalize();
      this.position.add(knockDir.multiplyScalar(1));
    }

    if (this.hp <= 0) {
      this.die();
    }
  }

  die(): void {
    this.state = 'dead';
    if (this.onDeathCallback) {
      this.onDeathCallback(this.id);
    }
  }

  isAlive(): boolean {
    return this.hp > 0 && this.state !== 'dead';
  }

  getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  getRotation(): number {
    return this.rotation;
  }

  getState(): EnemyState {
    return this.state;
  }

  getCurrentAction(): EnemyAction | null {
    return this.currentAction;
  }

  getHp(): number {
    return this.hp;
  }

  getMaxHp(): number {
    return this.definition.stats.hp;
  }

  getPoise(): number {
    return this.poise;
  }

  getMaxPoise(): number {
    return this.definition.stats.poise;
  }

  getDefiniton(): EnemyDefinition {
    return this.definition;
  }

  getDamage(): number {
    return this.currentAction?.type === 'attacking' 
      ? (this.currentAction as any).damage 
      : this.definition.stats.damage;
  }

  getPoiseDamage(): number {
    return 10;
  }

  getKnockback(): THREE.Vector3 {
    return new THREE.Vector3(0, 0, 2);
  }

  getAttackType(): 'light' | 'heavy' | 'special' {
    return 'light';
  }

  onDeath(callback: (id: string) => void): void {
    this.onDeathCallback = callback;
  }

  reset(position: THREE.Vector3): void {
    this.position = position.clone();
    this.hp = this.definition.stats.hp;
    this.poise = this.definition.stats.poise;
    this.state = 'idle';
    this.currentAction = null;
    this.hitStunTimer = 0;
    this.poiseRecoveryTimer = 0;
  }
}