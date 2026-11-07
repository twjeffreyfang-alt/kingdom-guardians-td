export type DefenderType =
  | 'alchemist' // Sunflower equivalent (Miner / Alchemist)
  | 'archer' // Peashooter equivalent (Royal Archer)
  | 'frost_mage' // Snow Pea equivalent (Cryomancer)
  | 'paladin' // Wall-nut equivalent (Knight with shield)
  | 'pyromancer' // Repeater / Fire Mage (High DPS dual caster)
  | 'grenadier' // Cherry Bomb / Catapult (Instant blast or mortar)
  | 'swordmaster'; // Melee rapid slasher

export interface DefenderConfig {
  id: DefenderType;
  name: string;
  title: string;
  cost: number;
  cooldown: number; // card cooldown in seconds
  hp: number;
  damage: number;
  attackInterval: number; // seconds between attacks
  description: string;
  icon: string;
  color: string;
  role: '生產' | '遠程' | '防禦' | '爆破' | '近戰' | '控制';
}

export interface PlacedDefender {
  id: string;
  type: DefenderType;
  row: number; // 0 to 4 (5 lanes)
  col: number; // 0 to 8 (9 columns)
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  lastAttackTime: number;
  lastProduceTime: number;
  attackTimer: number;
  animFrame: number;
  state: 'idle' | 'attacking' | 'hurt';
  totalKills: number;
  totalDamage: number;
}

export type EnemyCategory =
  | 'shadow_grunt' // Basic zombie
  | 'cone_raider' // Conehead zombie (Traffic cone / Leather hat)
  | 'iron_bucket' // Buckethead zombie (Iron bucket helm)
  | 'pole_vaulter' // Pole vaulter (Jumps over first defender)
  | 'necromancer' // Wizard summoner
  | 'ogre_giant'; // Gargantuar giant with big hammer

export interface EnemyConfig {
  id: EnemyCategory;
  name: string;
  hp: number;
  speed: number; // pixels per second
  damage: number; // damage per second to defender when eating/attacking
  scoreReward: number;
  goldReward: number;
  hasHat?: boolean;
  hatHp?: number;
  icon: string;
  color: string;
  description: string;
  isBoss?: boolean;
}

export interface ActiveEnemy {
  id: string;
  category: EnemyCategory;
  name: string;
  row: number; // current lane 0 to 4
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  hatHp: number;
  maxHatHp: number;
  hasHat?: boolean;
  speed: number;
  baseSpeed: number;
  damage: number;
  state: 'walking' | 'eating' | 'vaulting' | 'dead';
  targetDefenderId: string | null;
  slowTimer: number;
  freezeTimer: number;
  animFrame: number;
  hasVaulted?: boolean;
  scoreReward: number;
  goldReward: number;
}

export interface Projectile {
  id: string;
  row: number;
  x: number;
  y: number;
  speed: number;
  damage: number;
  damageType: 'arrow' | 'fireball' | 'frost' | 'bomb';
  color: string;
  radius: number;
  slowDuration?: number;
}

export interface FallingGold {
  id: string;
  x: number;
  y: number;
  targetY: number;
  amount: number;
  spawnTime: number;
  lifetime: number; // auto-collect after N seconds
  isCollected: boolean;
}

export interface LawnMower {
  row: number;
  x: number;
  y: number;
  active: boolean; // currently rolling across the screen
  triggered: boolean; // has been used
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  maxLife: number;
  currentLife: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  alpha: number;
  vy: number;
  life: number;
  maxLife: number;
}

export interface WaveGroup {
  enemyId: EnemyCategory;
  count: number;
  delay: number;
  interval: number;
}

export interface WaveConfig {
  waveNumber: number;
  title: string;
  groups: WaveGroup[];
  isHugeWave?: boolean;
}

export interface GameStage {
  id: string;
  name: string;
  subtitle: string;
  theme: {
    lawnLight: string;
    lawnDark: string;
    border: string;
  };
  startingGold: number;
  waves: WaveConfig[];
}
