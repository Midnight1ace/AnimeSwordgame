export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  effect: SkillEffect;
  prerequisite?: string;
  unlockCondition?: string;
}

export type SkillType = 'combat' | 'utility' | 'passive';

export interface SkillEffect {
  type: 'stat' | 'ability' | 'passive';
  name?: string;
  cost?: number;
  attribute?: 'damage' | 'stamina' | 'poise' | 'speed';
  bonus?: number;
}

export const SKILL_DEFINITIONS: Record<string, SkillDefinition> = {
  light_attack: {
    id: 'light_attack',
    name: 'Light Strike',
    description: 'Basic light attack combo',
    type: 'combat',
    effect: { type: 'ability', name: 'light_attack', cost: 8 },
  },

  heavy_attack: {
    id: 'heavy_attack',
    name: 'Heavy Strike',
    description: 'Powerful heavy attack',
    type: 'combat',
    effect: { type: 'ability', name: 'heavy_attack', cost: 15 },
  },

  dodge: {
    id: 'dodge',
    name: 'Quick Step',
    description: 'Dodge roll with iFrames',
    type: 'utility',
    effect: { type: 'ability', name: 'dodge', cost: 20 },
  },

  parry: {
    id: 'parry',
    name: 'Riposte',
    description: 'Counter incoming attacks',
    type: 'combat',
    effect: { type: 'ability', name: 'parry', cost: 10 },
    prerequisite: 'heavy_attack',
  },

  counter: {
    id: 'counter',
    name: 'Blade Counter',
    description: 'Counterattack after parry',
    type: 'combat',
    effect: { type: 'ability', name: 'counter', cost: 0 },
    prerequisite: 'parry',
  },

  second_wind: {
    id: 'second_wind',
    name: 'Second Wind',
    description: 'Recover stamina when low',
    type: 'passive',
    effect: { type: 'passive', name: 'stamina_regen', bonus: 0.3 },
    prerequisite: 'dodge',
  },

  blade_flourish: {
    id: 'blade_flourish',
    name: 'Blade Flourish',
    description: 'Finisher deals lingering damage',
    type: 'combat',
    effect: { type: 'stat', attribute: 'damage', bonus: 15 },
    prerequisite: 'counter',
  },

  swift_strikes: {
    id: 'swift_strikes',
    name: 'Swift Strikes',
    description: 'Attack speed increased',
    type: 'passive',
    effect: { type: 'stat', attribute: 'speed', bonus: 10 },
    prerequisite: 'second_wind',
  },

  iron_poise: {
    id: 'iron_poise',
    name: 'Iron Poise',
    description: 'Increased poise for stagger resistance',
    type: 'passive',
    effect: { type: 'stat', attribute: 'poise', bonus: 25 },
  },

  spirit_drain: {
    id: 'spirit_drain',
    name: 'Spirit Drain',
    description: 'Recover stamina on hit',
    type: 'passive',
    effect: { type: 'passive', name: 'stamina_on_hit', bonus: 3 },
    prerequisite: 'blade_flourish',
  },

  last_breath: {
    id: 'last_breath',
    name: 'Last Breath',
    description: 'Survive fatal blow once',
    type: 'passive',
    effect: { type: 'passive', name: 'extra_life', bonus: 1 },
    prerequisite: 'iron_poise',
  },

  curse_blade: {
    id: 'curse_blade',
    name: 'Curse Blade',
    description: 'Deal double damage when low HP',
    type: 'combat',
    effect: { type: 'stat', attribute: 'damage', bonus: 50 },
    prerequisite: 'spirit_drain',
  },
};