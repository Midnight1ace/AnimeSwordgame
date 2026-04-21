import { PlayerState } from './player';

export interface SaveData {
  version: string;
  timestamp: number;
  player: PlayerState;
  worldFlags: Record<string, boolean>;
  questState: QuestState[];
  settings: SaveSettings;
  stats: RunStats;
}

export interface QuestState {
  questId: string;
  currentStep: number;
  completed: boolean;
}

export interface SaveSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  brightness: number;
  vSync: boolean;
  gamepadEnabled: boolean;
}

export interface RunStats {
  totalPlayTime: number;
  deaths: number;
  enemiesDefeated: number;
  bossesDefeated: number;
  zonesVisited: string[];
}

export function createDefaultSaveData(player: PlayerState): SaveData {
  return {
    version: '1.0.0',
    timestamp: Date.now(),
    player,
    worldFlags: {},
    questState: [],
    settings: {
      masterVolume: 0.8,
      sfxVolume: 0.8,
      musicVolume: 0.6,
      brightness: 1.0,
      vSync: true,
      gamepadEnabled: true,
    },
    stats: {
      totalPlayTime: 0,
      deaths: 0,
      enemiesDefeated: 0,
      bossesDefeated: 0,
      zonesVisited: [],
    },
  };
}