import * as THREE from 'three';
import { DEFAULT_GAME_CONFIG, GameConfig } from '../../shared/types/config';

export class Bootstrap {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  clock: THREE.Clock;
  config: GameConfig;
  private container: HTMLElement;
  private animationId: number | null = null;
  private updateCallbacks: ((delta: number, total: number) => void)[] = [];
  private resizeCallback: (() => void) | null = null;

  constructor(container: HTMLElement, config: Partial<GameConfig> = {}) {
    this.container = container;
    this.config = { ...DEFAULT_GAME_CONFIG, ...config };
    this.clock = new THREE.Clock();

    this.renderer = this.createRenderer();
    this.scene = this.createScene();
    this.camera = this.createCamera();

    this.setupResize();
    this.appendRenderer();
  }

  private createRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    return renderer;
  }

  private createScene(): THREE.Scene {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    return scene;
  }

  private createCamera(): THREE.PerspectiveCamera {
    const { fov, near, far } = this.config.camera;
    const aspect = this.container.clientWidth / this.container.clientHeight;
    return new THREE.PerspectiveCamera(fov, aspect, near, far);
  }

  private setupResize(): void {
    this.resizeCallback = () => {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };
    window.addEventListener('resize', this.resizeCallback);
  }

  private appendRenderer(): void {
    this.renderer.domElement.id = 'game-canvas';
    this.container.appendChild(this.renderer.domElement);
    this.resizeCallback?.();
  }

  onUpdate(callback: (delta: number, total: number) => void): void {
    this.updateCallbacks.push(callback);
  }

  start(): void {
    this.clock.start();
    this.loop();
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private loop = (): void => {
    this.animationId = requestAnimationFrame(this.loop);
    const delta = this.clock.getDelta();
    const total = this.clock.getElapsedTime();

    for (const callback of this.updateCallbacks) {
      callback(delta, total);
    }

    this.renderer.render(this.scene, this.camera);
  };

  dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.resizeCallback as () => void);
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}