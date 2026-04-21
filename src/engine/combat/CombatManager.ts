import * as THREE from 'three';
import { DEFAULT_GAME_CONFIG } from '../../shared/types/config';
import { HitEvent } from './CombatTypes';

export interface Damageable {
  id: string;
  takeDamage(damage: number, poiseDamage: number, knockback: THREE.Vector3, source: string): void;
  isAlive(): boolean;
  getPosition(): THREE.Vector3;
}

export interface Damager {
  id: string;
  getDamage(): number;
  getPoiseDamage(): number;
  getKnockback(): THREE.Vector3;
  getAttackType(): 'light' | 'heavy' | 'special';
}

export class CombatManager {
  private damageables: Map<string, Damageable> = new Map();
  private hitEvents: HitEvent[] = [];
  private hitPauseCallback: ((duration: number) => void) | null = null;
  private config = DEFAULT_GAME_CONFIG.combat;

  registerDamageable(damageable: Damageable): void {
    this.damageables.set(damageable.id, damageable);
  }

  unregisterDamageable(id: string): void {
    this.damageables.delete(id);
  }

  getDamageable(id: string): Damageable | undefined {
    return this.damageables.get(id);
  }

  checkHit(_attacker: Damager, hitbox: THREE.Box3, ignoreId: string): Damageable | null {
    for (const [id, damageable] of this.damageables) {
      if (id === ignoreId) continue;
      if (!damageable.isAlive()) continue;

      const pos = damageable.getPosition();
      const boundingBox = new THREE.Box3(
        new THREE.Vector3(pos.x - 0.5, pos.y - 1, pos.z - 0.5),
        new THREE.Vector3(pos.x + 0.5, pos.y + 1, pos.z + 0.5)
      );

      if (hitbox.intersectsBox(boundingBox)) {
        return damageable;
      }
    }
    return null;
  }

  processHit(attacker: Damager, target: Damageable): void {
    const event: HitEvent = {
      attacker: attacker.id,
      target: target.id,
      damage: attacker.getDamage(),
      position: target.getPosition().clone(),
      type: attacker.getAttackType(),
      poiseDamage: attacker.getPoiseDamage(),
      knockback: attacker.getKnockback(),
    };

    this.hitEvents.push(event);
    target.takeDamage(
      event.damage,
      event.poiseDamage,
      event.knockback,
      attacker.id
    );

    if (this.hitPauseCallback) {
      this.hitPauseCallback(this.config.hitPauseDurationMs);
    }
  }

  setHitPauseCallback(callback: (duration: number) => void): void {
    this.hitPauseCallback = callback;
  }

  getHitEvents(): HitEvent[] {
    return this.hitEvents;
  }

  clearHitEvents(): void {
    this.hitEvents = [];
  }

  calculateHitboxPosition(
    origin: THREE.Vector3,
    _direction: THREE.Vector3,
    width: number,
    height: number,
    depth: number,
    offset: THREE.Vector3
  ): THREE.Box3 {
    const center = origin.clone().add(offset);
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const halfDepth = depth / 2;

    return new THREE.Box3(
      new THREE.Vector3(
        center.x - halfWidth,
        center.y - halfHeight,
        center.z - halfDepth
      ),
      new THREE.Vector3(
        center.x + halfWidth,
        center.y + halfHeight,
        center.z + halfDepth
      )
    );
  }

  raycastGround(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    maxDistance: number
  ): THREE.Vector3 | null {
    const groundY = 0;
    const t = (groundY - origin.y) / direction.y;
    if (t >= 0 && t <= maxDistance) {
      return origin.clone().add(direction.clone().multiplyScalar(t));
    }
    return null;
  }
}

export const combatManager = new CombatManager();