import * as THREE from 'three';

export interface CheckpointState {
  id: string;
  position: { x: number; y: number; z: number };
  zoneId: string;
  name: string;
  activated: boolean;
  visited: boolean;
}

export class Checkpoint {
  id: string;
  position: THREE.Vector3;
  zoneId: string;
  name: string;
  activated: boolean = false;
  visited: boolean = false;
  private activationRadius: number = 2;

  constructor(id: string, position: THREE.Vector3, zoneId: string, name: string) {
    this.id = id;
    this.position = position.clone();
    this.zoneId = zoneId;
    this.name = name;
  }

  checkActivation(playerPosition: THREE.Vector3): boolean {
    const dist = this.position.distanceTo(playerPosition);
    if (dist < this.activationRadius) {
      this.activated = true;
      this.visited = true;
      return true;
    }
    return false;
  }

  getState(): CheckpointState {
    return {
      id: this.id,
      position: { x: this.position.x, y: this.position.y, z: this.position.z },
      zoneId: this.zoneId,
      name: this.name,
      activated: this.activated,
      visited: this.visited,
    };
  }

  reset(): void {
    this.activated = false;
  }

  activate(): void {
    this.activated = true;
    this.visited = true;
  }
}