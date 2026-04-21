import * as THREE from 'three';
import { EnemyDefinition } from '../../shared/types/enemy';
import { EnemyState } from './EnemyTypes';

const COLORS: Record<string, number> = {
  grunt: 0x884444,
  warrior: 0x446688,
  speedster: 0x884488,
  tank: 0x888888,
  caster: 0x884488,
  ranged: 0x668844,
  elite: 0xaa4444,
  miniboss: 0xaa2222,
};

export class EnemyVisuals {
  private group: THREE.Group;
  private body: THREE.Mesh;
  private healthBar: THREE.Mesh;
  private poiseBar: THREE.Mesh;
  private stateLabel: THREE.Sprite;
  private scene: THREE.Scene;

  constructor(definition: EnemyDefinition, scene: THREE.Scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    const color = COLORS[definition.archetype] || 0x888888;
    const scale = definition.archetype === 'tank' ? 1.3 : 
                  definition.archetype === 'miniboss' ? 1.5 : 1;

    const bodyGeo = new THREE.CapsuleGeometry(0.4 * scale, 1.0 * scale, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.3,
      roughness: 0.7,
    });
    this.body = new THREE.Mesh(bodyGeo, bodyMat);
    this.body.position.y = 1.2 * scale;
    this.body.castShadow = true;
    this.group.add(this.body);

    const weaponGeo = new THREE.BoxGeometry(0.1, 0.1, 1.5 * scale);
    const weaponMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const weapon = new THREE.Mesh(weaponGeo, weaponMat);
    weapon.position.set(0.5 * scale, 1.3 * scale, 0.3);
    weapon.rotation.x = Math.PI / 4;
    this.group.add(weapon);

    const healthBarGeo = new THREE.PlaneGeometry(1, 0.1);
    const healthMat = new THREE.MeshBasicMaterial({ color: 0x44aa44 });
    this.healthBar = new THREE.Mesh(healthBarGeo, healthMat);
    this.healthBar.position.y = 2.8 * scale;
    this.group.add(this.healthBar);

    const poiseBarGeo = new THREE.PlaneGeometry(0.8, 0.08);
    const poiseMat = new THREE.MeshBasicMaterial({ color: 0x4488ff });
    this.poiseBar = new THREE.Mesh(poiseBarGeo, poiseMat);
    this.poiseBar.position.y = 2.6 * scale;
    this.group.add(this.poiseBar);

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(definition.name, 64, 22);
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture });
    this.stateLabel = new THREE.Sprite(spriteMat);
    this.stateLabel.scale.set(1.5, 0.4, 1);
    this.stateLabel.position.y = 3.2 * scale;
    this.group.add(this.stateLabel);

    scene.add(this.group);
  }

  update(position: THREE.Vector3, rotation: number, state: EnemyState): void {
    this.group.position.copy(position);
    this.group.rotation.y = rotation;

    let scale = 1;
    let color = 0x888888;
    
    switch (state) {
      case 'staggered':
        scale = 0.8;
        color = 0xff4444;
        break;
      case 'dead':
        scale = 0.5;
        color = 0x333333;
        break;
      case 'combat':
      case 'aggro':
        color = 0xff8888;
        break;
    }

    this.body.scale.setScalar(scale);
    (this.body.material as THREE.MeshStandardMaterial).color.setHex(color);
    this.healthBar.visible = state !== 'dead';
    this.poiseBar.visible = state !== 'dead' && state !== 'staggered';
    this.stateLabel.visible = state !== 'dead';
  }

  setHealthPercent(percent: number): void {
    this.healthBar.scale.x = percent;
    this.healthBar.position.x = (percent - 1) * 0.5;
  }

  setPoisePercent(percent: number): void {
    this.poiseBar.scale.x = percent;
    this.poiseBar.position.x = (percent - 1) * 0.4;
  }

  dispose(): void {
    this.scene.remove(this.group);
    this.body.geometry.dispose();
    (this.body.material as THREE.Material).dispose();
    this.healthBar.geometry.dispose();
    (this.healthBar.material as THREE.Material).dispose();
    this.poiseBar.geometry.dispose();
    (this.poiseBar.material as THREE.Material).dispose();
    (this.stateLabel.material as THREE.SpriteMaterial).map?.dispose();
    (this.stateLabel.material as THREE.Material).dispose();
  }
}