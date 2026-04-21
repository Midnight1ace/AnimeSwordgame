export interface ZoneDefinition {
  id: string;
  name: string;
  type: ZoneType;
  progressionGate: ProgressionGate;
  encounterList: string[];
  shortcuts: ZoneShortcut[];
  collectibles: CollectibleConfig[];
  narrativeTriggers: NarrativeTrigger[];
  envConfig: EnvironmentConfig;
}

export type ZoneType = 'hub' | 'residential' | 'industrial' | 'commercial' | 'sanctuary' | 'boss';

export interface ProgressionGate {
  type: 'boss' | 'item' | 'flag' | 'level';
  requirement?: string;
  levelRequired?: number;
}

export interface ZoneShortcut {
  id: string;
  fromArea: string;
  toArea: string;
  unlockCondition: UnlockCondition;
}

export interface UnlockCondition {
  type: 'boss_defeated' | 'item_used' | 'flag_set';
  target: string;
}

export interface CollectibleConfig {
  id: string;
  type: 'lore' | 'material' | 'key_item';
  position: { x: number; y: number; z: number };
  requirement?: string;
}

export interface NarrativeTrigger {
  id: string;
  triggerType: 'entry' | 'boss_entry' | 'landmark' | 'interact';
  position?: { x: number; y: number; z: number };
  radius?: number;
  flag?: string;
}

export interface EnvironmentConfig {
  ambientLight: { r: number; g: number; b: number };
  directionalLight: { r: number; g: number; b: number; x: number; y: number; z: number };
  fog: { color: { r: number; g: number; b: number }; near: number; far: number } | null;
  skyColor: { r: number; g: number; b: number };
}

export const ZONE_DEFINITIONS: Record<string, ZoneDefinition> = {
  hub_central: {
    id: 'hub_central',
    name: 'The Hollow',
    type: 'hub',
    progressionGate: { type: 'level', levelRequired: 1 },
    encounterList: [],
    shortcuts: [],
    collectibles: [],
    narrativeTriggers: [
      { id: 'hub_entry', triggerType: 'entry' },
    ],
    envConfig: {
      ambientLight: { r: 0.1, g: 0.1, b: 0.15 },
      directionalLight: { r: 0.6, g: 0.5, b: 0.4, x: -1, y: 1, z: 0.5 },
      fog: { color: { r: 0.05, g: 0.05, b: 0.08 }, near: 20, far: 80 },
      skyColor: { r: 0.05, g: 0.05, b: 0.08 },
    },
  },
  forbidden_district: {
    id: 'forbidden_district',
    name: 'Forbidden District',
    type: 'residential',
    progressionGate: { type: 'boss', requirement: 'none' },
    encounterList: [
      'encounter_forbidden_01',
      'encounter_forbidden_02',
      'encounter_forbidden_03',
    ],
    shortcuts: [
      {
        id: 'shortcut_01',
        fromArea: 'entrance',
        toArea: 'plaza',
        unlockCondition: { type: 'boss_defeated', target: 'mini_civilian' },
      },
    ],
    collectibles: [
      { id: 'lore_forbidden_history', type: 'lore', position: { x: 5, y: 1, z: 10 } },
    ],
    narrativeTriggers: [
      { id: 'district_entry', triggerType: 'entry', position: { x: 0, y: 0, z: 0 }, radius: 5 },
      { id: 'warden_gate', triggerType: 'boss_entry', position: { x: 0, y: 0, z: 25 }, radius: 8 },
    ],
    envConfig: {
      ambientLight: { r: 0.15, g: 0.1, b: 0.1 },
      directionalLight: { r: 0.5, g: 0.4, b: 0.3, x: 0.5, y: 1, z: 0.3 },
      fog: { color: { r: 0.1, g: 0.05, b: 0.05 }, near: 15, far: 50 },
      skyColor: { r: 0.15, g: 0.08, b: 0.08 },
    },
  },
};