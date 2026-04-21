export interface QuestDefinition {
  id: string;
  name: string;
  giver: string;
  steps: QuestStep[];
  rewards: QuestReward[];
}

export interface QuestStep {
  index: number;
  description: string;
  type: QuestStepType;
  target?: string;
  location?: { x: number; y: number; z: number };
  requiredFlag?: string;
}

export type QuestStepType = 'talk' | 'defeat' | 'collect' | 'reach' | 'escort' | 'custom';

export interface QuestReward {
  type: 'item' | 'skill' | 'currency' | 'unlock';
  id: string;
  quantity: number;
}

export const QUEST_DEFINITIONS: Record<string, QuestDefinition> = {
  prologue_revenge: {
    id: 'prologue_revenge',
    name: 'Path of Vengeance',
    giver: 'mentor_yami',
    steps: [
      {
        index: 0,
        description: 'Reach the central hub and speak with the mentor',
        type: 'talk',
        target: 'mentor_yami',
        location: { x: 0, y: 0, z: -5 },
      },
      {
        index: 1,
        description: 'Enter the Forbidden District',
        type: 'reach',
        location: { x: 0, y: 0, z: 15 },
      },
      {
        index: 2,
        description: 'Defeat the Warden Kage',
        type: 'defeat',
        target: 'warden_kage',
      },
    ],
    rewards: [
      { type: 'skill', id: 'parry', quantity: 1 },
      { type: 'currency', id: 'soul_shard', quantity: 500 },
    ],
  },
  learning_the_blade: {
    id: 'learning_the_blade',
    name: 'Learning the Blade',
    giver: 'mentor_yami',
    steps: [
      {
        index: 0,
        description: 'Learn the basic light attack combo',
        type: 'custom',
        target: 'unlock_light_combo',
      },
      {
        index: 1,
        description: 'Learn the heavy attack',
        type: 'custom',
        target: 'unlock_heavy_attack',
      },
      {
        index: 2,
        description: 'Learn the dodge roll',
        type: 'custom',
        target: 'unlock_dodge',
      },
    ],
    rewards: [
      { type: 'skill', id: 'counter', quantity: 1 },
    ],
  },
};