import { PlayerState, createDefaultPlayerState } from '../../shared/types/player';
import { SaveData, createDefaultSaveData, SaveSettings, RunStats } from '../../shared/types/save';
import { SAVE_KEY_PREFIX, MAX_SAVE_SLOTS } from '../../shared/constants';

const STORAGE_AVAILABLE = typeof window !== 'undefined' && 'localStorage' in window;

export interface SaveSlot {
  slot: number;
  timestamp: number;
  player: PlayerState;
  playTime: number;
  hasData: boolean;
}

export class SaveManager {
  private currentSlot: number = 0;
  private saveData: SaveData | null = null;
  private autoSaveEnabled: boolean = true;

  constructor() {
    this.loadSlotList();
  }

  getAvailableSlots(): SaveSlot[] {
    const slots: SaveSlot[] = [];
    
    for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
      const key = SAVE_KEY_PREFIX + `save_${i}`;
      const data = this.loadFromStorage(key);
      
      if (data) {
        slots.push({
          slot: i,
          timestamp: data.timestamp,
          player: data.player,
          playTime: data.stats.totalPlayTime,
          hasData: true,
        });
      } else {
        slots.push({
          slot: i,
          timestamp: 0,
          player: createDefaultPlayerState(),
          playTime: 0,
          hasData: false,
        });
      }
    }
    
    return slots;
  }

  loadSlotList(): void {}

  save(slot: number, data: Partial<SaveData>): boolean {
    if (!STORAGE_AVAILABLE) return false;

    try {
      const existingData = this.saveData || createDefaultSaveData(createDefaultPlayerState());
      
      const saveData: SaveData = {
        ...existingData,
        version: '1.0.0',
        timestamp: Date.now(),
        player: data.player ?? existingData.player,
        worldFlags: data.worldFlags ?? existingData.worldFlags,
        questState: data.questState ?? existingData.questState,
        settings: data.settings ?? existingData.settings,
        stats: data.stats ?? existingData.stats,
      };

      const key = SAVE_KEY_PREFIX + `save_${slot}`;
      localStorage.setItem(key, JSON.stringify(saveData));
      this.currentSlot = slot;
      this.saveData = saveData;
      
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }

  load(slot: number): SaveData | null {
    if (!STORAGE_AVAILABLE) return null;

    const key = SAVE_KEY_PREFIX + `save_${slot}`;
    const data = this.loadFromStorage(key);
    
    if (data) {
      this.currentSlot = slot;
      this.saveData = data;
      return data;
    }
    
    return null;
  }

  private loadFromStorage(key: string): SaveData | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      
      const data = JSON.parse(raw) as SaveData;
      return this.migrateSaveData(data);
    } catch {
      return null;
    }
  }

  private migrateSaveData(data: SaveData): SaveData {
    const version = data.version || '0.0.0';
    
    if (version === '1.0.0') {
      return data;
    }

    return data;
  }

  getCurrentSave(): SaveData | null {
    return this.saveData;
  }

  getCurrentSlot(): number {
    return this.currentSlot;
  }

  updatePlayerState(player: PlayerState): void {
    if (this.saveData) {
      this.saveData.player = player;
    }
  }

  updateWorldFlags(flags: Record<string, boolean>): void {
    if (this.saveData) {
      this.saveData.worldFlags = {
        ...this.saveData.worldFlags,
        ...flags,
      };
    }
  }

  getWorldFlag(flag: string): boolean {
    return this.saveData?.worldFlags[flag] ?? false;
  }

  setWorldFlag(flag: string, value: boolean): void {
    if (this.saveData) {
      this.saveData.worldFlags[flag] = value;
    }
  }

  updateStats(stats: Partial<RunStats>): void {
    if (this.saveData) {
      this.saveData.stats = {
        ...this.saveData.stats,
        ...stats,
      };
    }
  }

  incrementPlayTime(seconds: number): void {
    if (this.saveData) {
      this.saveData.stats.totalPlayTime += seconds;
    }
  }

  recordDeath(): void {
    if (this.saveData) {
      this.saveData.stats.deaths++;
    }
  }

  recordEnemyDefeated(): void {
    if (this.saveData) {
      this.saveData.stats.enemiesDefeated++;
    }
  }

  deleteSlot(slot: number): boolean {
    if (!STORAGE_AVAILABLE) return false;

    try {
      const key = SAVE_KEY_PREFIX + `save_${slot}`;
      localStorage.removeItem(key);
      
      if (this.currentSlot === slot) {
        this.saveData = null;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  saveSettings(settings: SaveSettings): void {
    if (this.saveData) {
      this.saveData.settings = settings;
    }
  }

  getSettings(): SaveSettings | null {
    return this.saveData?.settings ?? null;
  }

  hasSaveData(slot: number): boolean {
    if (!STORAGE_AVAILABLE) return false;
    
    const key = SAVE_KEY_PREFIX + `save_${slot}`;
    return localStorage.getItem(key) !== null;
  }

  autoSave(player: PlayerState, worldFlags: Record<string, boolean>): boolean {
    if (!this.autoSaveEnabled) return false;
    return this.save(-1, {
      player,
      worldFlags,
      stats: {
        totalPlayTime: this.saveData?.stats.totalPlayTime ?? 0,
        deaths: this.saveData?.stats.deaths ?? 0,
        enemiesDefeated: this.saveData?.stats.enemiesDefeated ?? 0,
        bossesDefeated: this.saveData?.stats.bossesDefeated ?? 0,
        zonesVisited: this.saveData?.stats.zonesVisited ?? [],
      },
    });
  }
}

export const saveManager = new SaveManager();