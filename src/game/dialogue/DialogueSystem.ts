import { InputManager } from '../../engine/input/Input';

export interface DialogueLine {
  speaker: string;
  portrait: string;
  text: string;
  emotion?: 'neutral' | 'angry' | 'sad' | 'happy' | 'surprised';
}

export interface DialogueSequence {
  id: string;
  lines: DialogueLine[];
}

export interface ActiveDialogue {
  sequence: DialogueSequence;
  currentLine: number;
  finished: boolean;
  choices?: DialogueChoice[];
}

export interface DialogueChoice {
  text: string;
  nextSequence: string;
  condition?: string;
}

const PORTRAIT_COLORS: Record<string, number> = {
  mentor_yami: 0x2a2a3a,
  citizen_01: 0x4a3a2a,
  warden_kage: 0x5a1a1a,
};

export class DialogueSystem {
  private dialogues: Map<string, DialogueSequence> = new Map();
  private activeDialogue: ActiveDialogue | null = null;
  private waitingForInput: boolean = false;
  private input: InputManager | null = null;
  private onDialogueStartCallback: ((speaker: string, text: string) => void) | null = null;
  private onDialogueEndCallback: (() => void) | null = null;

  constructor() {
    this.loadDefaultDialogues();
  }

  setInput(input: InputManager): void {
    this.input = input;
  }

  private loadDefaultDialogues(): void {
    this.dialogues.set('hub_mentor_intro', {
      id: 'hub_mentor_intro',
      lines: [
        {
          speaker: 'Yami',
          portrait: 'mentor_yami',
          text: 'So, you finally made it. The curse took everyone else, but you... you have something they didn\'t.',
          emotion: 'neutral',
        },
        {
          speaker: 'Yami',
          portrait: 'mentor_yami',
          text: 'The Forbidden District lies ahead. The Warden Kage guards the gate. He was once like us, before the corruption took hold.',
          emotion: 'sad',
        },
        {
          speaker: 'Yami',
          portrait: 'mentor_yami',
          text: 'Strike true. Show him what a real blade can do. Only then will the path forward open.',
          emotion: 'neutral',
        },
      ],
    });

    this.dialogues.set('warden_intro', {
      id: 'warden_intro',
      lines: [
        {
          speaker: 'Warden Kage',
          portrait: 'warden_kage',
          text: 'Another seeker of vengeance? They all come here seeking answers. None find them.',
          emotion: 'angry',
        },
        {
          speaker: 'Warden Kage',
          portrait: 'warden_kage',
          text: 'I was the gatekeeper. Now I am the gate. And those who pass through... they become part of it.',
          emotion: 'sad',
        },
        {
          speaker: 'Warden Kage',
          portrait: 'warden_kage',
          text: 'If you want to reach the Sanctum, you must cut through me. Try.',
          emotion: 'angry',
        },
      ],
    });

    this.dialogues.set('warden_victory', {
      id: 'warden_victory',
      lines: [
        {
          speaker: 'Warden Kage',
          portrait: 'warden_kage',
          text: 'Impressive... Perhaps there is hope yet for this cursed city.',
          emotion: 'surprised',
        },
        {
          speaker: 'Warden Kage',
          portrait: 'warden_kage',
          text: 'Take this. It will show you the way to the Sanctum. The true corruption awaits there.',
          emotion: 'neutral',
        },
        {
          speaker: 'Warden Kage',
          portrait: 'warden_kage',
          text: 'Be warned - what you seek may not be what you find. Go now. End this curse.',
          emotion: 'sad',
        },
      ],
    });
  }

  startDialogue(sequenceId: string): boolean {
    const sequence = this.dialogues.get(sequenceId);
    if (!sequence) return false;

    this.activeDialogue = {
      sequence,
      currentLine: 0,
      finished: false,
    };

    this.waitingForInput = true;
    this.notifyDialogueStart();

    return true;
  }

  update(_delta: number): void {
    if (!this.activeDialogue || !this.waitingForInput || !this.input) return;

    if (this.input.isJustPressed('interact') || this.input.isJustPressed('light_attack')) {
      this.advance();
    }
  }

  private advance(): void {
    if (!this.activeDialogue) return;

    const { currentLine, sequence } = this.activeDialogue;
    
    if (currentLine < sequence.lines.length - 1) {
      this.activeDialogue.currentLine++;
      this.notifyDialogueStart();
    } else {
      this.activeDialogue.finished = true;
      this.endDialogue();
    }
  }

  private notifyDialogueStart(): void {
    if (!this.activeDialogue || !this.onDialogueStartCallback) return;
    
    const line = this.activeDialogue.sequence.lines[this.activeDialogue.currentLine];
    this.onDialogueStartCallback(line.speaker, line.text);
  }

  private endDialogue(): void {
    this.activeDialogue = null;
    this.waitingForInput = false;
    
    if (this.onDialogueEndCallback) {
      this.onDialogueEndCallback();
    }
  }

  isActive(): boolean {
    return this.activeDialogue !== null;
  }

  getCurrentLine(): DialogueLine | null {
    if (!this.activeDialogue) return null;
    return this.activeDialogue.sequence.lines[this.activeDialogue.currentLine];
  }

  getProgress(): { current: number; total: number } | null {
    if (!this.activeDialogue) return null;
    return {
      current: this.activeDialogue.currentLine + 1,
      total: this.activeDialogue.sequence.lines.length,
    };
  }

  onDialogueStart(callback: (speaker: string, text: string) => void): void {
    this.onDialogueStartCallback = callback;
  }

  onDialogueEnd(callback: () => void): void {
    this.onDialogueEndCallback = callback;
  }

  getPortraitColor(speakerId: string): number {
    return PORTRAIT_COLORS[speakerId] ?? 0x666666;
  }
}