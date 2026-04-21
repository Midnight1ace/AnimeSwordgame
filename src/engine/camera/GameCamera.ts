import * as THREE from 'three';
import { CAMERA_ROTATION_SPEED, CAMERA_FOLLOW_SPEED } from '../../shared/constants';
import { CameraConfig } from '../../shared/types/config';
import { InputManager } from '../input/Input';

export type CameraMode = 'exploration' | 'lock_on' | 'boss_focus' | 'cutscene';

export class GameCamera {
  camera: THREE.PerspectiveCamera;
  config: CameraConfig;
  private target: THREE.Object3D | null = null;
  private mode: CameraMode = 'exploration';
  private currentPosition = new THREE.Vector3();
  private currentLookAt = new THREE.Vector3();
  private lockOnOffset = new THREE.Vector3(0, 1.5, -3);
  private pitch = 0;
  private yaw = 0;

  constructor(camera: THREE.PerspectiveCamera, config: CameraConfig) {
    this.camera = camera;
    this.config = config;
    this.currentPosition.copy(camera.position);
  }

  update(delta: number, input: InputManager, targetPos: THREE.Vector3): void {
    if (!this.target) {
      this.currentPosition.set(0, 2, 5);
      this.camera.position.copy(this.currentPosition);
      this.camera.lookAt(targetPos);
      return;
    }

    switch (this.mode) {
      case 'exploration':
        this.updateExploration(delta, input, targetPos);
        break;
      case 'lock_on':
        this.updateLockOn(delta, targetPos);
        break;
      case 'boss_focus':
        this.updateBossFocus(delta, targetPos);
        break;
    }

    this.camera.position.lerp(this.currentPosition, CAMERA_FOLLOW_SPEED * delta);
    this.camera.lookAt(this.currentLookAt);
  }

  private updateExploration(delta: number, input: InputManager, targetPos: THREE.Vector3): void {
    const movement = input.getMovementAxis();

    if (movement.x !== 0 || movement.z !== 0) {
      const rotation = this.calculateCameraRotation(movement);
      this.yaw = rotation.yaw;
      this.pitch = THREE.MathUtils.clamp(
        this.pitch + rotation.pitch * CAMERA_ROTATION_SPEED * delta,
        -Math.PI / 6,
        Math.PI / 4
      );
    }

    const targetObj = this.target;
    if (!targetObj) {
      this.currentPosition.set(targetPos.x, targetPos.y + 2, targetPos.z + 5);
      this.currentLookAt.copy(targetPos);
      return;
    }

    const targetPosition = new THREE.Vector3(
      targetObj.position.x + Math.sin(this.yaw) * this.config.explorationDistance,
      targetObj.position.y + Math.sin(this.pitch) * this.config.explorationDistance + 1.5,
      targetObj.position.z + Math.cos(this.yaw) * this.config.explorationDistance
    );

    this.currentPosition.copy(targetPosition);
    this.currentLookAt.set(targetPos.x, targetPos.y + 1.2, targetPos.z);
  }

  private updateLockOn(_delta: number, targetPos: THREE.Vector3): void {
    if (!this.target) return;

    const targetPosition = new THREE.Vector3(
      this.target.position.x + this.lockOnOffset.x,
      this.target.position.y + this.lockOnOffset.y,
      this.target.position.z + this.lockOnOffset.z
    );

    this.currentPosition.copy(targetPosition);
    this.currentLookAt.copy(targetPos);
  }

  private updateBossFocus(delta: number, targetPos: THREE.Vector3): void {
    const focusOffset = new THREE.Vector3(0, 3, -8);
    const targetPosition = targetPos.clone().add(focusOffset);
    this.currentPosition.lerp(targetPosition, delta * 2);
    this.currentLookAt.copy(targetPos);
  }

  private calculateCameraRotation(movement: { x: number; z: number }): { yaw: number; pitch: number } {
    const movementAngle = Math.atan2(movement.x, -movement.z);
    return { yaw: movementAngle, pitch: 0 };
  }

  setTarget(target: THREE.Object3D | null): void {
    this.target = target;
  }

  setMode(mode: CameraMode): void {
    this.mode = mode;
  }

  getMode(): CameraMode {
    return this.mode;
  }

  lookAt(position: THREE.Vector3): void {
    this.currentLookAt.copy(position);
  }

  isInLockOnRange(target: THREE.Vector3, current: THREE.Vector3): boolean {
    return current.distanceTo(target) <= this.config.lockOnDistance;
  }
}