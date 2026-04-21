import { PlayerState, createDefaultPlayerState, InventoryItem } from '../../shared/types/player';
import { WEAPON_DEFINITIONS, WeaponDefinition } from '../../shared/types/weapon';
import { SKILL_DEFINITIONS } from './SkillData';

export interface UpgradeResult {
  success: boolean;
  message: string;
}

export class ProgressionManager {
  private playerState: PlayerState;
  private onUpdateCallback: ((state: PlayerState) => void) | null = null;

  constructor() {
    this.playerState = createDefaultPlayerState();
  }

  loadState(state: PlayerState): void {
    this.playerState = { ...state };
  }

  getState(): PlayerState {
    return { ...this.playerState };
  }

  addXp(amount: number): void {
    this.playerState.xp += amount;
    this.checkLevelUp();
  }

  private checkLevelUp(): void {
    const xpRequired = this.getXpForLevel(this.playerState.level + 1);
    
    while (this.playerState.xp >= xpRequired) {
      this.playerState.level++;
      this.playerState.xp -= xpRequired;
      this.playerState.maxHp += 10;
      this.playerState.hp = this.playerState.maxHp;
      this.playerState.maxPoise += 5;
    }
    
    this.notifyUpdate();
  }

  getXpForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  addCurrency(amount: number): void {
    this.playerState.currency += amount;
    this.notifyUpdate();
  }

  spendCurrency(amount: number): boolean {
    if (this.playerState.currency < amount) return false;
    this.playerState.currency -= amount;
    this.notifyUpdate();
    return true;
  }

  healPlayer(amount: number): boolean {
    if (amount <= 0) return false;
    if (this.playerState.hp >= this.playerState.maxHp) return false;
    
    this.playerState.hp = Math.min(this.playerState.maxHp, this.playerState.hp + amount);
    this.notifyUpdate();
    return true;
  }

  restoreStamina(amount: number): boolean {
    if (amount <= 0) return false;
    this.playerState.stamina = Math.min(this.playerState.maxStamina?.() ?? 100, this.playerState.stamina + amount);
    this.notifyUpdate();
    return true;
  }

  addItem(itemId: string, quantity: number = 1): void {
    const existing = this.playerState.inventory.find(i => i.id === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.playerState.inventory.push({ id: itemId, quantity });
    }
    this.notifyUpdate();
  }

  removeItem(itemId: string, quantity: number = 1): boolean {
    const existing = this.playerState.inventory.find(i => i.id === itemId);
    if (!existing || existing.quantity < quantity) return false;
    
    existing.quantity -= quantity;
    if (existing.quantity <= 0) {
      this.playerState.inventory = this.playerState.inventory.filter(i => i.id !== itemId);
    }
    this.notifyUpdate();
    return true;
  }

  hasItem(itemId: string, quantity: number = 1): boolean {
    const item = this.playerState.inventory.find(i => i.id === itemId);
    return (item?.quantity ?? 0) >= quantity;
  }

  learnSkill(skillId: string): UpgradeResult {
    const skill = SKILL_DEFINITIONS[skillId];
    if (!skill) {
      return { success: false, message: 'Skill not found' };
    }
    
    if (this.playerState.unlockedSkills.includes(skillId)) {
      return { success: false, message: 'Skill already learned' };
    }

    if (skill.prerequisite && !this.playerState.unlockedSkills.includes(skill.prerequisite)) {
      return { success: false, message: 'Prerequisite skill not learned' };
    }

    this.playerState.unlockedSkills.push(skillId);
    this.notifyUpdate();
    return { success: true, message: `Learned ${skill.name}` };
  }

  canLearnSkill(skillId: string): boolean {
    const skill = SKILL_DEFINITIONS[skillId];
    if (!skill) return false;
    if (this.playerState.unlockedSkills.includes(skillId)) return false;
    if (skill.prerequisite && !this.playerState.unlockedSkills.includes(skill.prerequisite)) return false;
    return true;
  }

  upgradeWeapon(weaponId: string): UpgradeResult {
    const weapon = WEAPON_DEFINITIONS[weaponId];
    if (!weapon) {
      return { success: false, message: 'Weapon not found' };
    }

    const currentTier = this.getWeaponTier(weaponId);
    if (currentTier >= weapon.upgradePath.length) {
      return { success: false, message: 'Weapon already at max level' };
    }

    const upgrade = weapon.upgradePath[currentTier];
    if (!this.hasItem(upgrade.materialId, upgrade.materialCount)) {
      return { success: false, message: 'Missing materials' };
    }

    this.removeItem(upgrade.materialId, upgrade.materialCount);
    this.notifyUpdate();
    return { success: true, message: `Upgraded ${weapon.name} to tier ${currentTier + 1}` };
  }

  getWeaponTier(weaponId: string): number {
    return this.playerState.weaponTiers?.[weaponId] ?? 0;
  }

  setWeapon(weaponId: string): void {
    if (WEAPON_DEFINITIONS[weaponId]) {
      this.playerState.equippedWeapon = weaponId;
      this.notifyUpdate();
    }
  }

  getEquippedWeapon(): WeaponDefinition {
    return WEAPON_DEFINITIONS[this.playerState.equippedWeapon] ?? WEAPON_DEFINITIONS.katana;
  }

  getUnlockedSkills(): string[] {
    return [...this.playerState.unlockedSkills];
  }

  getInventory(): InventoryItem[] {
    return [...this.playerState.inventory];
  }

  takeDamage(damage: number): boolean {
    if (damage <= 0) return false;
    this.playerState.hp -= damage;
    
    if (this.playerState.hp <= 0) {
      this.playerState.hp = 0;
      this.notifyUpdate();
      return true;
    }
    
    this.notifyUpdate();
    return false;
  }

  isDead(): boolean {
    return this.playerState.hp <= 0;
  }

  revive(): void {
    this.playerState.hp = this.playerState.maxHp;
    this.playerState.stamina = this.playerState.maxStamina?.() ?? 100;
    this.notifyUpdate();
  }

  setCheckpoint(checkpointId: string): void {
    this.playerState.checkpoint = checkpointId;
    this.notifyUpdate();
  }

  getLevel(): number {
    return this.playerState.level;
  }

  getXp(): number {
    return this.playerState.xp;
  }

  getHp(): number {
    return this.playerState.hp;
  }

  getMaxHp(): number {
    return this.playerState.maxHp;
  }

  getCurrency(): number {
    return this.playerState.currency;
  }

  onUpdate(callback: (state: PlayerState) => void): void {
    this.onUpdateCallback = callback;
  }

  private notifyUpdate(): void {
    if (this.onUpdateCallback) {
      this.onUpdateCallback({ ...this.playerState });
    }
  }
}

export const progressionManager = new ProgressionManager();