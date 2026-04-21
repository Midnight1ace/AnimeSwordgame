import * as THREE from 'three';
import { PLAYER_HEIGHT } from '../../shared/constants';
import { GRAVITY, JUMP_VELOCITY } from '../../shared/constants';

export interface MotorState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  grounded: boolean;
  desiredSpeed: number;
}

export class CharacterMotor {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  private rotation: number = 0;
  private grounded: boolean = true;
  private desiredSpeed: number = 0;
  private moveSpeed: number = 5;
  private acceleration: number = 30;
  private deceleration: number = 20;
  private gravity: number = GRAVITY;

  constructor(position: THREE.Vector3 = new THREE.Vector3(0, PLAYER_HEIGHT, 0)) {
    this.position = position.clone();
    this.velocity = new THREE.Vector3();
  }

  update(delta: number, inputMovement: { x: number; z: number }, isLockedOn: boolean): void {
    if (inputMovement.x === 0 && inputMovement.z === 0) {
      this.desiredSpeed = 0;
    } else if (!isLockedOn) {
      this.desiredSpeed = this.moveSpeed;
    }

    const currentSpeed = this.getHorizontalSpeed();
    let newSpeed: number;

    if (this.desiredSpeed > currentSpeed) {
      newSpeed = Math.min(currentSpeed + this.acceleration * delta, this.desiredSpeed);
    } else {
      newSpeed = Math.max(currentSpeed - this.deceleration * delta, this.desiredSpeed);
    }

    if (inputMovement.x !== 0 || inputMovement.z !== 0) {
      this.rotation = Math.atan2(inputMovement.x, -inputMovement.z);
    }

    const horizontalVelocity = new THREE.Vector3(
      inputMovement.x * newSpeed,
      0,
      inputMovement.z * newSpeed
    );

    this.velocity.x = horizontalVelocity.x;
    this.velocity.z = horizontalVelocity.z;

    if (!this.grounded) {
      this.velocity.y += this.gravity * delta;
    }

    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
    this.position.z += this.velocity.z * delta;

    if (this.position.y < PLAYER_HEIGHT) {
      this.position.y = PLAYER_HEIGHT;
      this.velocity.y = 0;
      this.grounded = true;
    }
  }

  getHorizontalSpeed(): number {
    return Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
  }

  getRotation(): number {
    return this.rotation;
  }

  setRotation(rotation: number): void {
    this.rotation = rotation;
  }

  isGrounded(): boolean {
    return this.grounded;
  }

  setGrounded(grounded: boolean): void {
    this.grounded = grounded;
  }

  applyImpulse(impulse: THREE.Vector3): void {
    this.velocity.add(impulse);
  }

  setPosition(position: THREE.Vector3): void {
    this.position.copy(position);
  }

  jump(): void {
    if (this.grounded) {
      this.velocity.y = JUMP_VELOCITY;
      this.grounded = false;
    }
  }

  dodge(direction: THREE.Vector3, dodgeSpeed: number = 15): void {
    this.velocity.x = direction.x * dodgeSpeed;
    this.velocity.z = direction.z * dodgeSpeed;
    this.velocity.y = 2;
    this.grounded = false;
  }

  stop(): void {
    this.velocity.set(0, this.velocity.y, 0);
  }
}