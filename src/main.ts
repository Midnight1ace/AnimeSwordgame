import * as THREE from 'three';
import { Bootstrap } from './app/bootstrap/Bootstrap';
import { InputManager } from './engine/input/Input';
import { GameCamera } from './engine/camera/GameCamera';
import { CharacterMotor } from './engine/physics/CharacterMotor';
import { PlayerCombatController } from './engine/combat/PlayerCombatController';
import { combatManager } from './engine/combat/CombatManager';
import { EnemyFactory } from './game/enemies/EnemyFactory';
import { DEFAULT_GAME_CONFIG } from './shared/types/config';
import { PLAYER_HEIGHT } from './shared/constants';

class Game {
  private bootstrap: Bootstrap;
  private input: InputManager;
  private gameCamera: GameCamera;
  private motor: CharacterMotor;
  private playerCombat: PlayerCombatController;
  private enemyFactory: EnemyFactory;
  private playerMesh: THREE.Group;
  private floorMesh: THREE.Mesh;
  private arenaGroup: THREE.Group;

  constructor() {
    const container = document.getElementById('app')!;

    this.bootstrap = new Bootstrap(container, {
      camera: DEFAULT_GAME_CONFIG.camera,
      combat: DEFAULT_GAME_CONFIG.combat,
    });

    this.input = new InputManager();
    this.gameCamera = new GameCamera(this.bootstrap.camera, DEFAULT_GAME_CONFIG.camera);
    this.motor = new CharacterMotor(new THREE.Vector3(0, PLAYER_HEIGHT, 0));
    this.playerCombat = new PlayerCombatController(this.input, 'katana');
    this.enemyFactory = new EnemyFactory(this.bootstrap.scene);

    this.playerMesh = this.createPlayerMesh();
    this.floorMesh = this.createFloorMesh();
    this.arenaGroup = this.createArena();

    this.bootstrap.scene.add(this.playerMesh);
    this.bootstrap.scene.add(this.floorMesh);
    this.bootstrap.scene.add(this.arenaGroup);

    this.setupLighting();
    this.setupEnvironment();
    this.spawnTestEnemies();

    combatManager.setHitPauseCallback((duration) => {
      this.playerCombat.triggerHitPause(duration / 1000);
    });
  }

  private createPlayerMesh(): THREE.Group {
    const group = new THREE.Group();

    const bodyGeo = new THREE.CapsuleGeometry(0.35, 0.9, 4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x3388ff,
      metalness: 0.4,
      roughness: 0.6,
      emissive: 0x112244,
      emissiveIntensity: 0.3,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.15;
    body.castShadow = true;
    group.add(body);

    const headGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xffccaa,
      roughness: 0.8,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.85;
    group.add(head);

    const weaponGeo = new THREE.BoxGeometry(0.06, 0.06, 1.2);
    const weaponMat = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.8,
      roughness: 0.2,
    });
    const weapon = new THREE.Mesh(weaponGeo, weaponMat);
    weapon.position.set(0.4, 1.2, 0.3);
    weapon.rotation.y = -0.3;
    group.add(weapon);

    const glowGeo = new THREE.RingGeometry(0.1, 0.15, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x4488ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = 0.05;
    glow.rotation.x = -Math.PI / 2;
    group.add(glow);

    return group;
  }

  private createFloorMesh(): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(50, 50);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x1a1a24,
      metalness: 0.2,
      roughness: 0.85,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    return mesh;
  }

  private createArena(): THREE.Group {
    const group = new THREE.Group();

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a3a,
      metalness: 0.1,
      roughness: 0.9,
    });

    const wallConfigs = [
      { pos: [0, 2, 25], scale: [50, 4, 0.5], rot: 0 },
      { pos: [0, 2, -25], scale: [50, 4, 0.5], rot: 0 },
      { pos: [25, 2, 0], scale: [0.5, 4, 50], rot: 0 },
      { pos: [-25, 2, 0], scale: [0.5, 4, 50], rot: 0 },
    ];

    for (const config of wallConfigs) {
      const geo = new THREE.BoxGeometry(config.scale[0], config.scale[1], config.scale[2]);
      const wall = new THREE.Mesh(geo, wallMat.clone());
      wall.position.set(config.pos[0], config.pos[1], config.pos[2]);
      wall.receiveShadow = true;
      group.add(wall);
    }

    const pillarGeo = new THREE.CylinderGeometry(0.8, 1, 4, 8);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x333344,
      metalness: 0.3,
      roughness: 0.7,
    });

    const pillarPositions = [
      [-15, 2, -15], [15, 2, -15], [-15, 2, 15], [15, 2, 15],
      [-10, 2, 10], [10, 2, 10],
    ];

    for (const pos of pillarPositions) {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(pos[0], pos[1], pos[2]);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      group.add(pillar);
    }

    const platformGeo = new THREE.CylinderGeometry(3, 3, 0.3, 16);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a4a,
      metalness: 0.4,
      roughness: 0.6,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.set(0, 0.15, 15);
    platform.receiveShadow = true;
    group.add(platform);

    return group;
  }

  private setupLighting(): void {
    const ambient = new THREE.AmbientLight(0x303050, 0.6);
    this.bootstrap.scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0x4466aa, 0x111122, 0.4);
    this.bootstrap.scene.add(hemi);

    const directional = new THREE.DirectionalLight(0xffeedd, 1.5);
    directional.position.set(8, 15, 8);
    directional.castShadow = true;
    directional.shadow.mapSize.width = 2048;
    directional.shadow.mapSize.height = 2048;
    directional.shadow.camera.near = 1;
    directional.shadow.camera.far = 50;
    directional.shadow.camera.left = -30;
    directional.shadow.camera.right = 30;
    directional.shadow.camera.top = 30;
    directional.shadow.camera.bottom = -30;
    directional.shadow.bias = -0.001;
    this.bootstrap.scene.add(directional);

    const fillLight = new THREE.DirectionalLight(0x6688ff, 0.3);
    fillLight.position.set(-5, 5, -5);
    this.bootstrap.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xff4466, 0.2);
    rimLight.position.set(0, 3, -10);
    this.bootstrap.scene.add(rimLight);
  }

  private setupEnvironment(): void {
    this.bootstrap.scene.background = new THREE.Color(0x0a0a14);
    this.bootstrap.scene.fog = new THREE.FogExp2(0x0a0a14, 0.02);

    const gridHelper = new THREE.GridHelper(50, 50, 0x222233, 0x1a1a24);
    gridHelper.position.y = 0.01;
    this.bootstrap.scene.add(gridHelper);
  }

  private spawnTestEnemies(): void {
    this.enemyFactory.spawnEnemy('human_grunt', new THREE.Vector3(-5, 0, 5));
    this.enemyFactory.spawnEnemy('human_grunt', new THREE.Vector3(5, 0, 5));
    this.enemyFactory.spawnEnemy('human_warrior', new THREE.Vector3(0, 0, 10));
    this.enemyFactory.spawnEnemy('speedster', new THREE.Vector3(8, 0, -5));
    this.enemyFactory.spawnEnemy('elite_warrior', new THREE.Vector3(0, 0, 15));
  }

  init(): void {
    this.input.init();
    this.gameCamera.setTarget(this.playerMesh);
    this.bootstrap.start();

    this.bootstrap.onUpdate((delta, total) => {
      this.update(delta, total);
    });
  }

  private update(delta: number, total: number): void {
    this.input.update(total * 1000);

    const isLockedOn = this.input.isPressed('lock_on');
    const movement = this.input.getMovementAxis();

    if (this.playerCombat.isDodging()) {
      const direction = this.playerCombat.getDodgeDirection();
      this.motor.dodge(direction, 18);
    }

    this.motor.update(delta, movement, isLockedOn);
    this.playerCombat.update(delta);
    
    this.playerMesh.position.copy(this.motor.position);
    this.playerMesh.rotation.y = this.motor.getRotation();

    const body = this.playerMesh.children[0] as THREE.Mesh;
    if (body && body.material instanceof THREE.MeshStandardMaterial) {
      if (this.playerCombat.isAttacking()) {
        body.material.emissive.setHex(0x4488ff);
        body.material.emissiveIntensity = 0.5;
      } else if (this.playerCombat.isParrying()) {
        body.material.emissive.setHex(0x88ff88);
        body.material.emissiveIntensity = 0.8;
      } else if (this.playerCombat.isDodging()) {
        body.material.emissive.setHex(0x88ffff);
        body.material.emissiveIntensity = 0.6;
      } else if (this.playerCombat.isStaggered() || this.playerCombat.isHit()) {
        body.material.emissive.setHex(0xff4444);
        body.material.emissiveIntensity = 0.5;
      } else {
        body.material.emissive.setHex(0x112244);
        body.material.emissiveIntensity = 0.3;
      }
    }

    if (this.playerCombat.isAttacking()) {
      const hitbox = this.playerCombat.getHitbox();
      const pos = this.playerMesh.position.clone();
      const direction = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.motor.getRotation());
      
      const box = new THREE.Box3(
        new THREE.Vector3(
          pos.x + hitbox.offset.x * direction.x - hitbox.width / 2,
          pos.y + hitbox.offset.y,
          pos.z + hitbox.offset.z * direction.z - hitbox.depth / 2
        ),
        new THREE.Vector3(
          pos.x + hitbox.offset.x * direction.x + hitbox.width / 2,
          pos.y + hitbox.offset.y + 1,
          pos.z + hitbox.offset.z * direction.z + hitbox.depth / 2
        )
      );

      const enemies = this.enemyFactory.getAllEnemies();
      for (const enemy of enemies) {
        if (!enemy.isAlive()) continue;
        const enemyPos = enemy.getPosition();
        const enemyBox = new THREE.Box3(
          new THREE.Vector3(enemyPos.x - 0.5, enemyPos.y, enemyPos.z - 0.5),
          new THREE.Vector3(enemyPos.x + 0.5, enemyPos.y + 2, enemyPos.z + 0.5)
        );
        
        if (box.intersectsBox(enemyBox)) {
          enemy.takeDamage(
            this.playerCombat.getDamage(),
            this.playerCombat.getPoiseDamage(),
            this.playerCombat.getKnockback(),
            'player'
          );
        }
      }

      if (this.playerCombat.getCurrentAttackStep() < 2) {
        this.playerCombat.advanceCombo();
      } else {
        this.playerCombat.resetCombo();
      }
    }

    const playerPos = this.playerMesh.position.clone();
    this.enemyFactory.update(delta, playerPos);

    this.gameCamera.update(delta, this.input, playerPos);
  }

  dispose(): void {
    this.input.dispose();
    this.enemyFactory.dispose();
    this.bootstrap.dispose();
  }
}

const game = new Game();
game.init();