import * as THREE from 'three';
import { EnemyBase } from './EnemyBase';
import { ENEMY_DEFINITIONS } from '../../shared/types/enemy';
import { EnemyVisuals } from './EnemyVisuals';

export class EnemyFactory {
  private scene: THREE.Scene;
  private enemies: Map<string, EnemyBase> = new Map();
  private visuals: Map<string, EnemyVisuals> = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  spawnEnemy(typeId: string, position: THREE.Vector3, instanceId?: string): EnemyBase | null {
    const definition = ENEMY_DEFINITIONS[typeId];
    if (!definition) {
      console.warn(`Enemy type ${typeId} not found`);
      return null;
    }

    const id = instanceId || `${typeId}_${Date.now()}`;
    const enemy = new EnemyBase(id, definition, position);
    const enemyVisuals = new EnemyVisuals(definition, this.scene);

    this.enemies.set(id, enemy);
    this.visuals.set(id, enemyVisuals);

    enemy.onDeath((enemyId) => {
      this.removeEnemy(enemyId);
    });

    return enemy;
  }

  update(delta: number, playerPosition: THREE.Vector3): void {
    for (const [id, enemy] of this.enemies) {
      enemy.update(delta, playerPosition);
      
      const visuals = this.visuals.get(id);
      if (visuals) {
        visuals.update(enemy.getPosition(), enemy.getRotation(), enemy.getState());
      }
    }
  }

  getEnemy(id: string): EnemyBase | undefined {
    return this.enemies.get(id);
  }

  getAllEnemies(): EnemyBase[] {
    return Array.from(this.enemies.values());
  }

  removeEnemy(id: string): void {
    this.enemies.get(id);
    const visuals = this.visuals.get(id);
    
    if (visuals) {
      visuals.dispose();
      this.visuals.delete(id);
    }
    
    this.enemies.delete(id);
  }

  dispose(): void {
    for (const [id] of this.enemies) {
      this.removeEnemy(id);
    }
  }
}