export interface InputAction {
  name: string;
  key: string;
  gamepad?: string;
  holdable: boolean;
}

export interface InputState {
  pressed: boolean;
  justPressed: boolean;
  justReleased: boolean;
  heldDuration: number;
}

const DEFAULT_ACTIONS: InputAction[] = [
  { name: 'move_forward', key: 'KeyW', gamepad: 'Axis1-', holdable: true },
  { name: 'move_back', key: 'KeyS', gamepad: 'Axis1+', holdable: true },
  { name: 'move_left', key: 'KeyA', gamepad: 'Axis0-', holdable: true },
  { name: 'move_right', key: 'KeyD', gamepad: 'Axis0+', holdable: true },
  { name: 'light_attack', key: 'KeyJ', gamepad: 'Button0', holdable: false },
  { name: 'heavy_attack', key: 'KeyK', gamepad: 'Button1', holdable: false },
  { name: 'dodge', key: 'Space', gamepad: 'Button2', holdable: false },
  { name: 'parry', key: 'ShiftLeft', gamepad: 'Button3', holdable: false },
  { name: 'lock_on', key: 'Tab', gamepad: 'Button4', holdable: false },
  { name: 'interact', key: 'KeyE', gamepad: 'Button5', holdable: false },
  { name: 'menu', key: 'Escape', gamepad: 'Button6', holdable: false },
  { name: 'pause', key: 'Escape', gamepad: 'Start', holdable: false },
];

export class InputManager {
  private actionStates: Map<string, InputState> = new Map();
  private keyMap: Map<string, string> = new Map();
  private gamepadMap: Map<string, string> = new Map();
  private actions: InputAction[];
  private deadzone = 0.15;
  private lastTime = 0;
  private gamepadIndex: number | null = null;

  constructor(actions: InputAction[] = DEFAULT_ACTIONS) {
    this.actions = actions;
    this.buildMaps();
    this.initializeStates();
  }

  private buildMaps(): void {
    for (const action of this.actions) {
      this.keyMap.set(action.key, action.name);
      if (action.gamepad) {
        this.gamepadMap.set(action.gamepad, action.name);
      }
    }
  }

  private initializeStates(): void {
    for (const action of this.actions) {
      this.actionStates.set(action.name, {
        pressed: false,
        justPressed: false,
        justReleased: false,
        heldDuration: 0,
      });
    }
  }

  init(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('gamepadconnected', this.onGamepadConnected);
    window.addEventListener('gamepaddisconnected', this.onGamepadDisconnected);
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('gamepadconnected', this.onGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.onGamepadDisconnected);
  }

  update(currentTime: number): void {
    const dt = Math.min(currentTime - this.lastTime, 100);
    this.lastTime = currentTime;

    for (const [, state] of this.actionStates) {
      if (state.justPressed) {
        state.justPressed = false;
        state.heldDuration = dt;
      } else if (state.pressed) {
        state.heldDuration += dt;
      }
      if (state.justReleased) {
        state.justReleased = false;
      }
    }

    this.pollGamepad();
  }

  isPressed(actionName: string): boolean {
    return this.actionStates.get(actionName)?.pressed ?? false;
  }

  isJustPressed(actionName: string): boolean {
    return this.actionStates.get(actionName)?.justPressed ?? false;
  }

  isJustReleased(actionName: string): boolean {
    return this.actionStates.get(actionName)?.justReleased ?? false;
  }

  getHeldDuration(actionName: string): number {
    return this.actionStates.get(actionName)?.heldDuration ?? 0;
  }

  getMovementAxis(): { x: number; z: number } {
    let x = 0;
    let z = 0;

    if (this.isPressed('move_forward')) z -= 1;
    if (this.isPressed('move_back')) z += 1;
    if (this.isPressed('move_left')) x -= 1;
    if (this.isPressed('move_right')) x += 1;

    const gamepad = this.getGamepadState();
    if (gamepad) {
      if (Math.abs(gamepad.axis0) > this.deadzone) x = gamepad.axis0;
      if (Math.abs(gamepad.axis1) > this.deadzone) z = gamepad.axis1;
    }

    const magnitude = Math.sqrt(x * x + z * z);
    if (magnitude > 1) {
      x /= magnitude;
      z /= magnitude;
    }

    return { x, z };
  }

  private getGamepadState(): { axis0: number; axis1: number } | null {
    if (this.gamepadIndex === null) return null;
    const gamepads = navigator.getGamepads();
    const gp = gamepads[this.gamepadIndex];
    if (!gp) return null;
    return { axis0: gp.axes[0] ?? 0, axis1: gp.axes[1] ?? 0 };
  }

  private pollGamepad(): void {
    if (this.gamepadIndex === null) return;
    const gamepads = navigator.getGamepads();
    const gp = gamepads[this.gamepadIndex];
    if (!gp) return;

    for (const [gpBinding, actionName] of this.gamepadMap) {
      let pressed = false;
      if (gpBinding.startsWith('Button')) {
        const index = parseInt(gpBinding.slice(7));
        pressed = gp.buttons[index]?.pressed ?? false;
      } else if (gpBinding.startsWith('Axis')) {
        const match = gpBinding.match(/Axis(\d)([+-])/);
        if (match) {
          const axisIndex = parseInt(match[1]);
          const sign = match[2] === '+' ? 1 : -1;
          pressed = (gp.axes[axisIndex] ?? 0) * sign > this.deadzone;
        }
      }
      this.updateState(actionName, pressed);
    }
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    const actionName = this.keyMap.get(e.code);
    if (!actionName) return;
    e.preventDefault();
    const action = this.actions.find((a) => a.name === actionName);
    if (action?.holdable) {
      this.updateState(actionName, true);
    } else if (!this.actionStates.get(actionName)?.pressed) {
      this.updateState(actionName, true);
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    const actionName = this.keyMap.get(e.code);
    if (!actionName) return;
    this.updateState(actionName, false);
  };

  private onGamepadConnected = (e: GamepadEvent): void => {
    if (this.gamepadIndex === null) {
      this.gamepadIndex = e.gamepad.index;
    }
  };

  private onGamepadDisconnected = (e: GamepadEvent): void => {
    if (this.gamepadIndex === e.gamepad.index) {
      this.gamepadIndex = null;
    }
  };

  private updateState(actionName: string, pressed: boolean): void {
    const state = this.actionStates.get(actionName);
    if (!state) return;

    if (pressed && !state.pressed) {
      state.justPressed = true;
      state.pressed = true;
    } else if (!pressed && state.pressed) {
      state.justReleased = true;
      state.pressed = false;
      state.heldDuration = 0;
    }
  }
}