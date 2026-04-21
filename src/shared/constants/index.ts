export const GAME_TITLE = 'Anime Sword Game';
export const GAME_VERSION = '1.0.0';

export const INPUT_DEBOUNCE_MS = 16;

export const PLAYER_HEIGHT = 1.8;
export const PLAYER_COLLISION_RADIUS = 0.4;

export const GRAVITY = -30;
export const JUMP_VELOCITY = 8;

export const LOCK_ON_ANGLE_THRESHOLD = 30;
export const CAMERA_ROTATION_SPEED = 2.0;
export const CAMERA_FOLLOW_SPEED = 10;

export const ANIMATION_BLEND_TIME = 0.1;
export const ATTACK_ANIMATION_SPEED = 1.0;

export const HP_REGEN_RATE = 0.5;
export const STAMINA_REGEN_DELAY = 500;

export const SAVE_KEY_PREFIX = 'animesword_';
export const MAX_SAVE_SLOTS = 3;

export const ASSET_PATH_MODELS = '/assets/models';
export const ASSET_PATH_TEXTURES = '/assets/textures';
export const ASSET_PATH_AUDIO = '/assets/audio';
export const ASSET_PATH_FX = '/assets/fx';

export const ENUM_WEAPON_STYLES = ['katana', 'dual_blades', 'greatsword'] as const;
export const ENUM_ENEMY_ARCHETYPES = [
  'grunt',
  'warrior',
  'ranged',
  'speedster',
  'tank',
  'caster',
  'elite',
  'miniboss',
] as const;

export const ZONE_TYPES = ['hub', 'residential', 'industrial', 'commercial', 'sanctuary', 'boss'] as const;