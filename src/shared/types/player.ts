export interface PlayerState {
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina?: () => number;
  poise: number;
  maxPoise: number;
  xp: number;
  level: number;
  currency: number;
  equippedWeapon: string;
  unlockedSkills: string[];
  checkpoint: string;
  inventory: InventoryItem[];
  weaponTiers?: Record<string, number>;
}

export interface InventoryItem {
  id: string;
  quantity: number;
}

export function createDefaultPlayerState(): PlayerState {
  return {
    hp: 100,
    maxHp: 100,
    stamina: 100,
    maxStamina: () => 100,
    poise: 50,
    maxPoise: 50,
    xp: 0,
    level: 1,
    currency: 0,
    equippedWeapon: 'katana',
    unlockedSkills: ['light_attack', 'heavy_attack', 'dodge'],
    checkpoint: 'start',
    inventory: [],
    weaponTiers: {},
  };
}