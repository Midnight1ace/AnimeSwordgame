import * as THREE from 'three';
import { ZoneDefinition, ZONE_DEFINITIONS } from '../../shared/types/zone';
import { Checkpoint } from './Checkpoint';

export type WorldState = 'exploration' | 'dialogue' | 'boss_intro' | 'boss_fight' | 'boss_outro' | 'menu';

export interface ZoneTransition {
  fromZone: string;
  toZone: string;
  triggerPosition: THREE.Vector3;
  triggerRadius: number;
  gateType: 'open' | 'boss_lock' | 'level_lock' | 'item_lock';
  requirement?: string;
}

export class WorldFlow {
  private currentZoneId: string = 'hub_central';
  private worldState: WorldState = 'exploration';
  private zones: Map<string, ZoneDefinition> = new Map();
  private checkpoints: Map<string, Checkpoint> = new Map();
  private activeCheckpoint: Checkpoint | null = null;
  private unlockedZones: Set<string> = new Set(['hub_central']);
  private shortcuts: Map<string, boolean> = new Map();

  private onZoneChangeCallback: ((zoneId: string) => void) | null = null;
  private onCheckpointActivateCallback: ((checkpoint: Checkpoint) => void) | null = null;

  constructor() {
    this.loadZones();
    this.createCheckpoints();
  }

  private loadZones(): void {
    for (const [id, definition] of Object.entries(ZONE_DEFINITIONS)) {
      this.zones.set(id, definition);
    }
  }

  private createCheckpoints(): void {
    const hub = this.zones.get('hub_central');
    if (hub) {
      const checkpoint = new Checkpoint(
        'hub_shrine',
        new THREE.Vector3(0, 0, 0),
        'hub_central',
        'The Hollow Shrine'
      );
      this.checkpoints.set('hub_shrine', checkpoint);
    }
  }

  update(_delta: number, playerPosition: THREE.Vector3): void {
    if (this.worldState !== 'exploration') return;

    for (const [, checkpoint] of this.checkpoints) {
      if (checkpoint.checkActivation(playerPosition)) {
        if (this.activeCheckpoint?.id !== checkpoint.id) {
          this.activateCheckpoint(checkpoint);
        }
      }
    }
  }

  private activateCheckpoint(checkpoint: Checkpoint): void {
    this.activeCheckpoint = checkpoint;
    if (this.onCheckpointActivateCallback) {
      this.onCheckpointActivateCallback(checkpoint);
    }
  }

  getCurrentZone(): ZoneDefinition | undefined {
    return this.zones.get(this.currentZoneId);
  }

  getActiveCheckpoint(): Checkpoint | null {
    return this.activeCheckpoint;
  }

  getWorldState(): WorldState {
    return this.worldState;
  }

  setWorldState(state: WorldState): void {
    this.worldState = state;
  }

  isTransitionAllowed(toZoneId: string): boolean {
    if (!this.unlockedZones.has(toZoneId)) return false;
    
    const currentZone = this.zones.get(this.currentZoneId);
    if (!currentZone) return false;

    const gate = currentZone.progressionGate;
    switch (gate.type) {
      case 'boss':
        return true;
      case 'level':
        return true;
      case 'flag':
        return true;
      case 'item':
        return true;
      default:
        return true;
    }
  }

  transitionTo(toZoneId: string): boolean {
    if (!this.isTransitionAllowed(toZoneId)) return false;
    if (!this.zones.has(toZoneId)) return false;

    this.currentZoneId = toZoneId;
    this.unlockedZones.add(toZoneId);

    if (this.onZoneChangeCallback) {
      this.onZoneChangeCallback(toZoneId);
    }

    return true;
  }

  unlockShortcut(shortcutId: string): void {
    this.shortcuts.set(shortcutId, true);
  }

  isShortcutUnlocked(shortcutId: string): boolean {
    return this.shortcuts.get(shortcutId) ?? false;
  }

  setCheckpoint(checkpointId: string): void {
    const checkpoint = this.checkpoints.get(checkpointId);
    if (checkpoint) {
      this.activeCheckpoint = checkpoint;
    }
  }

  onZoneChange(callback: (zoneId: string) => void): void {
    this.onZoneChangeCallback = callback;
  }

  onCheckpointActivate(callback: (checkpoint: Checkpoint) => void): void {
    this.onCheckpointActivateCallback = callback;
  }

  getZoneName(): string {
    return this.zones.get(this.currentZoneId)?.name ?? 'Unknown';
  }

  getCheckpointList(): Checkpoint[] {
    return Array.from(this.checkpoints.values());
  }
}