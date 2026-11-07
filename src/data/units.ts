import { DefenderConfig, DefenderType, EnemyCategory, EnemyConfig, GameStage } from '../types/game';

export const DEFENDERS_CONFIG: Record<DefenderType, DefenderConfig> = {
  alchemist: {
    id: 'alchemist',
    name: '皇家鍊金工',
    title: '採礦鍊金士',
    cost: 50,
    cooldown: 5,
    hp: 300,
    damage: 0,
    attackInterval: 12, // produces gold every 12s
    description: '身穿皮製工匠服的人類鍊金術士，週期性從地底煉出閃耀的王國黃金 (+25🪙)。',
    icon: '⛏️',
    color: '#fbbf24',
    role: '生產',
  },

  archer: {
    id: 'archer',
    name: '王國長弓手',
    title: '精準斥候射手',
    cost: 100,
    cooldown: 5,
    hp: 300,
    damage: 22,
    attackInterval: 1.4,
    description: '披著翠綠斗篷的精銳人類弓箭手，向前直線持續射擊銳利箭矢，擊退逼近的敵人。',
    icon: '🏹',
    color: '#10b981',
    role: '遠程',
  },

  frost_mage: {
    id: 'frost_mage',
    name: '寒霜魔女',
    title: '冰霜詠唱者',
    cost: 175,
    cooldown: 7,
    hp: 300,
    damage: 24,
    attackInterval: 1.4,
    description: '身著幽藍法袍的人類女法師，發射極寒冰霜彈，使整條路徑上的敵人移動速度降低 50%。',
    icon: '❄️',
    color: '#38bdf8',
    role: '控制',
  },

  paladin: {
    id: 'paladin',
    name: '聖殿重甲騎士',
    title: '堅毅鋼鐵之盾',
    cost: 50,
    cooldown: 20,
    hp: 4000,
    damage: 0,
    attackInterval: 0,
    description: '手持獅心重裝塔盾的人類聖騎士，擁有極高的生命厚度，英勇阻擋怪物前進！',
    icon: '🛡️',
    color: '#94a3b8',
    role: '防禦',
  },

  pyromancer: {
    id: 'pyromancer',
    name: '烈焰魔導士',
    title: '雙重熾焰法師',
    cost: 200,
    cooldown: 7,
    hp: 300,
    damage: 30,
    attackInterval: 1.2,
    description: '掌握熾熱烈焰的人類火系魔導士，每次攻擊連續投擲兩枚爆裂火球，殺傷力驚人！',
    icon: '🔥',
    color: '#ea580c',
    role: '遠程',
  },

  grenadier: {
    id: 'grenadier',
    name: '爆破擲彈兵',
    title: '矮人火藥專家',
    cost: 150,
    cooldown: 25,
    hp: 500,
    damage: 1800,
    attackInterval: 1.2, // short fuse
    description: '放置後點燃特製高爆炸藥，數秒後引爆，徹底消滅周圍 3x3 區域內的所有敵軍！',
    icon: '💣',
    color: '#dc2626',
    role: '爆破',
  },

  swordmaster: {
    id: 'swordmaster',
    name: '王國劍術大師',
    title: '迅捷斬擊劍豪',
    cost: 150,
    cooldown: 8,
    hp: 500,
    damage: 35,
    attackInterval: 0.5,
    description: '手持精鋼長劍的人類劍豪，對臨近身前的敵人發動狂風暴雨般的近戰高速連擊！',
    icon: '🗡️',
    color: '#818cf8',
    role: '近戰',
  },
};

export const ENEMIES_CONFIG: Record<EnemyCategory, EnemyConfig> = {
  shadow_grunt: {
    id: 'shadow_grunt',
    name: '暗影雜兵',
    hp: 200,
    speed: 24,
    damage: 30, // dps to defender
    scoreReward: 50,
    goldReward: 10,
    icon: '🧟',
    color: '#64748b',
    description: '普通的暗影人形士兵，步履蹣跚但數量眾多。',
  },

  cone_raider: {
    id: 'cone_raider',
    name: '青銅角盔突擊兵',
    hp: 200,
    hasHat: true,
    hatHp: 370,
    speed: 25,
    damage: 35,
    scoreReward: 100,
    goldReward: 20,
    icon: '🪖',
    color: '#d97706',
    description: '頭戴堅固青銅頭盔的突擊步兵，頭盔能抵擋大量箭矢與法術傷害。',
  },

  iron_bucket: {
    id: 'iron_bucket',
    name: '鐵桶重甲衛士',
    hp: 200,
    hasHat: true,
    hatHp: 900,
    speed: 22,
    damage: 40,
    scoreReward: 180,
    goldReward: 35,
    icon: '🪣',
    color: '#475569',
    description: '頭頂厚重鐵桶的重裝悍將，防禦力極其驚人，需要集火消滅。',
  },

  pole_vaulter: {
    id: 'pole_vaulter',
    name: '撐竿跳暗殺斥候',
    hp: 350,
    speed: 48, // fast before vault
    damage: 35,
    scoreReward: 150,
    goldReward: 30,
    icon: '🏃',
    color: '#a855f7',
    description: '手持長撐竿的敏捷斥候，在撞見第一個防守者時會縱身一躍飛越防線！',
  },

  necromancer: {
    id: 'necromancer',
    name: '死靈術士',
    hp: 450,
    speed: 18,
    damage: 25,
    scoreReward: 220,
    goldReward: 40,
    icon: '🧙',
    color: '#7c3aed',
    description: '操縱暗黑死靈法術的巫師，行走過程中會定期召喚骷髏小卒支援。',
  },

  ogre_giant: {
    id: 'ogre_giant',
    name: '撼地狂暴巨魔',
    hp: 3000,
    speed: 16,
    damage: 150,
    scoreReward: 800,
    goldReward: 100,
    isBoss: true,
    icon: '👹',
    color: '#991b1b',
    description: '體型龐大的人型狂暴巨魔，手中揮舞巨型石槌，能直接砸扁防守士兵！',
  },
};

export const STAGES_DATA: GameStage[] = [
  {
    id: 'stage_1',
    name: '王國前線草坪',
    subtitle: '第一關 · 陽光普照的王國邊陲',
    theme: {
      lawnLight: '#4ade80', // lush bright green
      lawnDark: '#22c55e', // alternating checkerboard lawn
      border: '#15803d',
    },
    startingGold: 150,
    waves: [
      {
        waveNumber: 1,
        title: '第一波：先遣暗影斥候',
        groups: [{ enemyId: 'shadow_grunt', count: 3, delay: 5, interval: 8 }],
      },
      {
        waveNumber: 2,
        title: '第二波：角盔先鋒抵達',
        groups: [
          { enemyId: 'shadow_grunt', count: 4, delay: 2, interval: 6 },
          { enemyId: 'cone_raider', count: 2, delay: 8, interval: 7 },
        ],
      },
      {
        waveNumber: 3,
        title: '第三波：撐竿跳斥候突襲',
        groups: [
          { enemyId: 'shadow_grunt', count: 5, delay: 2, interval: 5 },
          { enemyId: 'pole_vaulter', count: 2, delay: 6, interval: 8 },
          { enemyId: 'cone_raider', count: 2, delay: 10, interval: 6 },
        ],
      },
      {
        waveNumber: 4,
        title: '第四波：鐵桶重裝精銳',
        groups: [
          { enemyId: 'shadow_grunt', count: 6, delay: 1, interval: 4 },
          { enemyId: 'iron_bucket', count: 2, delay: 5, interval: 8 },
          { enemyId: 'pole_vaulter', count: 2, delay: 8, interval: 6 },
        ],
      },
      {
        waveNumber: 5,
        title: '第五波：一大波敵人正在逼近！',
        isHugeWave: true,
        groups: [
          { enemyId: 'shadow_grunt', count: 10, delay: 1, interval: 2 },
          { enemyId: 'cone_raider', count: 4, delay: 3, interval: 4 },
          { enemyId: 'iron_bucket', count: 3, delay: 6, interval: 5 },
          { enemyId: 'pole_vaulter', count: 3, delay: 8, interval: 4 },
        ],
      },
      {
        waveNumber: 6,
        title: '第六波：死靈術士召喚行軍',
        groups: [
          { enemyId: 'necromancer', count: 2, delay: 2, interval: 8 },
          { enemyId: 'iron_bucket', count: 4, delay: 4, interval: 5 },
          { enemyId: 'shadow_grunt', count: 8, delay: 6, interval: 3 },
        ],
      },
      {
        waveNumber: 7,
        title: '第七波：雙線撐竿暗殺大隊',
        groups: [
          { enemyId: 'pole_vaulter', count: 5, delay: 1, interval: 4 },
          { enemyId: 'cone_raider', count: 6, delay: 3, interval: 3 },
          { enemyId: 'necromancer', count: 2, delay: 7, interval: 6 },
        ],
      },
      {
        waveNumber: 8,
        title: '第八波：鐵甲狂潮',
        groups: [
          { enemyId: 'iron_bucket', count: 6, delay: 2, interval: 4 },
          { enemyId: 'shadow_grunt', count: 12, delay: 4, interval: 2 },
          { enemyId: 'pole_vaulter', count: 4, delay: 6, interval: 3 },
        ],
      },
      {
        waveNumber: 9,
        title: '第九波：狂暴巨魔前鋒探路',
        groups: [
          { enemyId: 'ogre_giant', count: 1, delay: 3, interval: 10 },
          { enemyId: 'iron_bucket', count: 5, delay: 6, interval: 4 },
          { enemyId: 'shadow_grunt', count: 10, delay: 8, interval: 2 },
        ],
      },
      {
        waveNumber: 10,
        title: '第十波：最終決戰！深淵軍團全面進攻！',
        isHugeWave: true,
        groups: [
          { enemyId: 'ogre_giant', count: 2, delay: 2, interval: 12 },
          { enemyId: 'iron_bucket', count: 8, delay: 4, interval: 3 },
          { enemyId: 'necromancer', count: 4, delay: 6, interval: 4 },
          { enemyId: 'pole_vaulter', count: 6, delay: 8, interval: 3 },
          { enemyId: 'shadow_grunt', count: 16, delay: 10, interval: 1.5 },
        ],
      },
    ],
  },

  {
    id: 'stage_2',
    name: '暮色皇室庭院',
    subtitle: '第二關 · 暗影籠罩下的宮廷中庭',
    theme: {
      lawnLight: '#38bdf8', // crystal cyan turf
      lawnDark: '#0284c7',
      border: '#0369a1',
    },
    startingGold: 175,
    waves: [
      {
        waveNumber: 1,
        title: '第一波：夜巡幽鬼步兵',
        groups: [{ enemyId: 'shadow_grunt', count: 6, delay: 3, interval: 5 }],
      },
      {
        waveNumber: 2,
        title: '第二波：青銅與鐵甲小隊',
        groups: [
          { enemyId: 'cone_raider', count: 4, delay: 2, interval: 4 },
          { enemyId: 'iron_bucket', count: 3, delay: 5, interval: 6 },
        ],
      },
      {
        waveNumber: 3,
        title: '第三波：撐竿長驅突襲',
        groups: [
          { enemyId: 'pole_vaulter', count: 6, delay: 2, interval: 3 },
          { enemyId: 'shadow_grunt', count: 8, delay: 4, interval: 3 },
        ],
      },
      {
        waveNumber: 4,
        title: '第四波：死靈夜宴召喚',
        groups: [
          { enemyId: 'necromancer', count: 3, delay: 2, interval: 6 },
          { enemyId: 'iron_bucket', count: 5, delay: 4, interval: 4 },
        ],
      },
      {
        waveNumber: 5,
        title: '第五波：一大波暗影狂潮！',
        isHugeWave: true,
        groups: [
          { enemyId: 'ogre_giant', count: 2, delay: 2, interval: 10 },
          { enemyId: 'iron_bucket', count: 6, delay: 5, interval: 3 },
          { enemyId: 'pole_vaulter', count: 6, delay: 7, interval: 3 },
          { enemyId: 'shadow_grunt', count: 15, delay: 9, interval: 2 },
        ],
      },
    ],
  },
];
