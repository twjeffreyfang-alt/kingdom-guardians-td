/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ActiveEnemy,
  DefenderType,
  FallingGold,
  FloatingText,
  GameStage,
  LawnMower,
  Particle,
  PlacedDefender,
  Projectile,
} from './types/game';
import { DEFENDERS_CONFIG, ENEMIES_CONFIG, STAGES_DATA } from './data/units';
import { soundManager } from './utils/audio';
import {
  GameCanvas,
  GRID_ROWS,
  GRID_COLS,
  GRID_START_X,
  GRID_START_Y,
  CELL_WIDTH,
  CELL_HEIGHT,
  getCellCenter,
  getRowY,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from './components/GameCanvas';
import { HUD } from './components/HUD';
import { UnitSelector } from './components/UnitSelector';
import { BestiaryModal } from './components/BestiaryModal';
import { MapSelectModal } from './components/MapSelectModal';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';

interface QueuedEnemy {
  enemyId: string;
  row: number;
  spawnTime: number; // in-game second timestamp
}

export default function App() {
  // Current stage
  const [currentStage, setCurrentStage] = useState<GameStage>(STAGES_DATA[0]);

  // Game state
  const [defenders, setDefenders] = useState<PlacedDefender[]>([]);
  const [enemies, setEnemies] = useState<ActiveEnemy[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [fallingGolds, setFallingGolds] = useState<FallingGold[]>([]);
  const [lawnMowers, setLawnMowers] = useState<LawnMower[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  const [gold, setGold] = useState<number>(currentStage.startingGold);
  const [score, setScore] = useState<number>(0);
  const [totalKills, setTotalKills] = useState<number>(0);

  const [currentWave, setCurrentWave] = useState<number>(1);
  const [waveActive, setWaveActive] = useState<boolean>(true);
  const [isHugeWaveApproaching, setIsHugeWaveApproaching] = useState<boolean>(false);

  // Speed and audio
  const [gameSpeed, setGameSpeed] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundManager.enabled);

  // Card Cooldowns
  const [cardCooldowns, setCardCooldowns] = useState<Record<string, number>>({});
  const [selectedDefenderType, setSelectedDefenderType] = useState<DefenderType | null>(null);
  const [isShovelActive, setIsShovelActive] = useState<boolean>(false);

  // Modals
  const [isBestiaryOpen, setIsBestiaryOpen] = useState<boolean>(false);
  const [isStageSelectOpen, setIsStageSelectOpen] = useState<boolean>(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState<boolean>(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState<boolean>(false);

  // Ref container for smooth high-performance 60FPS loop
  const stateRef = useRef({
    defenders,
    enemies,
    projectiles,
    fallingGolds,
    lawnMowers,
    particles,
    floatingTexts,
    gold,
    score,
    totalKills,
    currentWave,
    waveActive,
    currentStage,
    gameSpeed,
    isPaused,
    cardCooldowns,
    spawnQueue: [] as QueuedEnemy[],
    waveElapsedTime: 0,
    nextSkyGoldTime: 6.0,
    isHugeWaveApproaching,
  });

  // Sync ref
  useEffect(() => {
    stateRef.current.defenders = defenders;
    stateRef.current.enemies = enemies;
    stateRef.current.projectiles = projectiles;
    stateRef.current.fallingGolds = fallingGolds;
    stateRef.current.lawnMowers = lawnMowers;
    stateRef.current.particles = particles;
    stateRef.current.floatingTexts = floatingTexts;
    stateRef.current.gold = gold;
    stateRef.current.score = score;
    stateRef.current.totalKills = totalKills;
    stateRef.current.currentWave = currentWave;
    stateRef.current.waveActive = waveActive;
    stateRef.current.currentStage = currentStage;
    stateRef.current.gameSpeed = gameSpeed;
    stateRef.current.isPaused = isPaused;
    stateRef.current.cardCooldowns = cardCooldowns;
    stateRef.current.isHugeWaveApproaching = isHugeWaveApproaching;
  });

  // Init LawnMowers (1 per lane)
  const initLawnMowers = useCallback(() => {
    const mowers: LawnMower[] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      mowers.push({
        row: r,
        x: GRID_START_X - 35,
        y: getRowY(r),
        active: false,
        triggered: false,
      });
    }
    return mowers;
  }, []);

  // Reset Game
  const resetGame = useCallback(
    (stage: GameStage = currentStage) => {
      setCurrentStage(stage);
      setDefenders([]);
      setEnemies([]);
      setProjectiles([]);
      setFallingGolds([]);
      setParticles([]);
      setFloatingTexts([]);
      setLawnMowers(initLawnMowers());
      setGold(stage.startingGold);
      setScore(0);
      setTotalKills(0);
      setCurrentWave(1);
      setWaveActive(true);
      setIsHugeWaveApproaching(false);
      setSelectedDefenderType(null);
      setIsShovelActive(false);
      setCardCooldowns({});
      setIsVictoryOpen(false);
      setIsGameOverOpen(false);

      // Setup Wave 1 queue
      const waveConfig = stage.waves[0];
      const queue: QueuedEnemy[] = [];
      waveConfig.groups.forEach((grp) => {
        for (let i = 0; i < grp.count; i++) {
          queue.push({
            enemyId: grp.enemyId,
            row: Math.floor(Math.random() * GRID_ROWS),
            spawnTime: grp.delay + i * grp.interval,
          });
        }
      });
      queue.sort((a, b) => a.spawnTime - b.spawnTime);
      stateRef.current.spawnQueue = queue;
      stateRef.current.waveElapsedTime = 0;
      stateRef.current.nextSkyGoldTime = 5.0;
    },
    [currentStage, initLawnMowers]
  );

  // Initialize on mount
  useEffect(() => {
    resetGame(currentStage);
  }, []);

  // Collect Falling Gold / Sunlight
  const handleCollectGold = useCallback((goldId: string) => {
    soundManager.playCoin();
    setFallingGolds((prev) =>
      prev.map((g) => {
        if (g.id === goldId) {
          setGold((cur) => cur + g.amount);
          // Sparkle particles
          setParticles((pts) => [
            ...pts,
            ...Array.from({ length: 8 }, () => {
              const angle = Math.random() * Math.PI * 2;
              const spd = Math.random() * 80 + 20;
              return {
                x: g.x,
                y: g.y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                radius: Math.random() * 3 + 2,
                color: '#fbbf24',
                alpha: 1,
                maxLife: 0.4,
                currentLife: 0,
              };
            }),
          ]);
          return { ...g, isCollected: true };
        }
        return g;
      })
    );
  }, []);

  // Place Defender
  const handlePlaceDefender = useCallback(
    (row: number, col: number) => {
      if (!selectedDefenderType) return;
      const cfg = DEFENDERS_CONFIG[selectedDefenderType];

      // Check affordability & cooldown
      if (gold < cfg.cost) return;
      if ((cardCooldowns[selectedDefenderType] || 0) > 0) return;

      // Check occupied
      const occupied = defenders.some((d) => d.row === row && d.col === col);
      if (occupied) return;

      soundManager.playUpgrade();
      setGold((g) => g - cfg.cost);

      // Start cooldown
      setCardCooldowns((prev) => ({ ...prev, [selectedDefenderType]: cfg.cooldown }));

      const pos = getCellCenter(row, col);

      const newDefender: PlacedDefender = {
        id: Math.random().toString(36).substring(2, 9),
        type: selectedDefenderType,
        row,
        col,
        x: pos.x,
        y: pos.y,
        hp: cfg.hp,
        maxHp: cfg.hp,
        lastAttackTime: 0,
        lastProduceTime: performance.now() / 1000,
        attackTimer: 0,
        animFrame: 0,
        state: 'idle',
        totalKills: 0,
        totalDamage: 0,
      };

      setDefenders((prev) => [...prev, newDefender]);
      setSelectedDefenderType(null);

      // Bombardier special: explodes 1.2s after placement!
      if (selectedDefenderType === 'grenadier') {
        setTimeout(() => {
          soundManager.playExplosion();
          // Remove bombardier
          setDefenders((prev) => prev.filter((d) => d.id !== newDefender.id));

          // Blast particles
          const blastParticles: Particle[] = [];
          for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * 180 + 30;
            blastParticles.push({
              x: pos.x,
              y: pos.y,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              radius: Math.random() * 5 + 3,
              color: Math.random() > 0.4 ? '#dc2626' : '#f59e0b',
              alpha: 1,
              maxLife: 0.6,
              currentLife: 0,
            });
          }
          setParticles((pts) => [...pts, ...blastParticles]);

          // Damage all enemies in 3x3 grid around pos
          setEnemies((ens) =>
            ens.map((enemy) => {
              const d = Math.hypot(enemy.x - pos.x, enemy.y - pos.y);
              if (d <= CELL_WIDTH * 1.5) {
                const newHp = enemy.hp - 1800;
                return {
                  ...enemy,
                  hp: newHp,
                  state: newHp <= 0 ? 'dead' : enemy.state,
                };
              }
              return enemy;
            })
          );
        }, 1200);
      }
    },
    [cardCooldowns, defenders, gold, selectedDefenderType]
  );

  // Remove Defender (Shovel)
  const handleRemoveDefender = useCallback(
    (row: number, col: number) => {
      const target = defenders.find((d) => d.row === row && d.col === col);
      if (target) {
        soundManager.playCoin();
        const refund = Math.floor(DEFENDERS_CONFIG[target.type].cost * 0.4);
        setGold((g) => g + refund);
        setDefenders((prev) => prev.filter((d) => d.id !== target.id));
        setFloatingTexts((ft) => [
          ...ft,
          {
            id: Math.random().toString(),
            x: target.x,
            y: target.y - 20,
            text: `回收 +${refund}🪙`,
            color: '#fbbf24',
            size: 14,
            alpha: 1,
            vy: -25,
            life: 0,
            maxLife: 1.0,
          },
        ]);
      }
      setIsShovelActive(false);
    },
    [defenders]
  );

  // Keyboard Shortcuts [1] to [7], [S] for Shovel, [Space] for Pause, [ESC] for Cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused((p) => !p);
      } else if (e.key === 'Escape') {
        setSelectedDefenderType(null);
        setIsShovelActive(false);
      } else if (e.key.toLowerCase() === 's') {
        setIsShovelActive((v) => !v);
        setSelectedDefenderType(null);
      } else if (['1', '2', '3', '4', '5', '6', '7'].includes(e.key)) {
        const types: DefenderType[] = [
          'alchemist',
          'archer',
          'frost_mage',
          'paladin',
          'pyromancer',
          'swordmaster',
          'grenadier',
        ];
        const chosen = types[parseInt(e.key, 10) - 1];
        if (chosen) {
          setSelectedDefenderType(chosen);
          setIsShovelActive(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // MAIN 60FPS PvZ GAME LOOP
  useEffect(() => {
    let lastTime = performance.now();
    let animId: number;

    const loop = (now: number) => {
      const dtRaw = (now - lastTime) / 1000;
      lastTime = now;

      const dt = Math.min(0.1, dtRaw) * (stateRef.current.isPaused ? 0 : stateRef.current.gameSpeed);

      if (dt > 0) {
        const s = stateRef.current;
        const nowSec = now / 1000;

        // 1. Update Card Cooldowns
        const updatedCds: Record<string, number> = {};
        let cdsChanged = false;
        Object.entries(s.cardCooldowns).forEach(([key, rem]) => {
          if (rem > 0) {
            const next = Math.max(0, rem - dt);
            updatedCds[key] = next;
            cdsChanged = true;
          }
        });
        if (cdsChanged) {
          s.cardCooldowns = updatedCds;
          setCardCooldowns(updatedCds);
        }

        // 2. Sunlight / Gold dropping from the sky periodically
        s.nextSkyGoldTime -= dt;
        if (s.nextSkyGoldTime <= 0) {
          s.nextSkyGoldTime = 8.0 + Math.random() * 3.0;
          const dropX = GRID_START_X + Math.random() * (GRID_COLS * CELL_WIDTH - 60) + 30;
          const targetY = GRID_START_Y + Math.random() * (GRID_ROWS * CELL_HEIGHT - 60) + 30;

          s.fallingGolds.push({
            id: Math.random().toString(36).substring(2, 9),
            x: dropX,
            y: 0,
            targetY,
            amount: 25,
            spawnTime: nowSec,
            lifetime: 14.0,
            isCollected: false,
          });
        }

        // 3. Update Falling Golds
        const nextGolds: FallingGold[] = [];
        s.fallingGolds.forEach((gold) => {
          if (gold.isCollected) return;

          // Float down until targetY
          if (gold.y < gold.targetY) {
            gold.y += 85 * dt;
          }

          // Auto collect if untouched for too long
          if (nowSec - gold.spawnTime > gold.lifetime) {
            gold.isCollected = true;
            s.gold += gold.amount;
            setGold(s.gold);
            soundManager.playCoin();
          } else {
            nextGolds.push(gold);
          }
        });
        s.fallingGolds = nextGolds;
        setFallingGolds(nextGolds);

        // 4. Wave Spawning Queue
        if (s.waveActive) {
          s.waveElapsedTime += dt;
          const remainingQueue: QueuedEnemy[] = [];

          s.spawnQueue.forEach((item) => {
            if (item.spawnTime <= s.waveElapsedTime) {
              const cfg = ENEMIES_CONFIG[item.enemyId as keyof typeof ENEMIES_CONFIG];
              if (cfg) {
                const newEnemy: ActiveEnemy = {
                  id: Math.random().toString(36).substring(2, 9),
                  category: cfg.id,
                  name: cfg.name,
                  row: item.row,
                  x: CANVAS_WIDTH + 20,
                  y: getRowY(item.row),
                  hp: cfg.hp,
                  maxHp: cfg.hp,
                  hatHp: cfg.hatHp || 0,
                  maxHatHp: cfg.hatHp || 0,
                  hasHat: !!cfg.hasHat,
                  speed: cfg.speed,
                  baseSpeed: cfg.speed,
                  damage: cfg.damage,
                  state: 'walking',
                  targetDefenderId: null,
                  slowTimer: 0,
                  freezeTimer: 0,
                  animFrame: 0,
                  scoreReward: cfg.scoreReward,
                  goldReward: cfg.goldReward,
                };
                s.enemies.push(newEnemy);
              }
            } else {
              remainingQueue.push(item);
            }
          });
          s.spawnQueue = remainingQueue;

          // Next Wave check
          if (remainingQueue.length === 0 && s.enemies.length === 0) {
            if (s.currentWave < s.currentStage.waves.length) {
              const nextWaveIdx = s.currentWave; // 1-indexed to array index
              const nextWaveConfig = s.currentStage.waves[nextWaveIdx];

              if (nextWaveConfig.isHugeWave) {
                setIsHugeWaveApproaching(true);
                soundManager.playWaveHorn();
                s.floatingTexts.push({
                  id: Math.random().toString(),
                  x: CANVAS_WIDTH / 2,
                  y: CANVAS_HEIGHT / 2 - 40,
                  text: '🚨 一大波深淵軍團正在逼近！',
                  color: '#ef4444',
                  size: 24,
                  alpha: 1,
                  vy: -15,
                  life: 0,
                  maxLife: 3.0,
                });
              }

              // Load next wave queue
              const newQ: QueuedEnemy[] = [];
              nextWaveConfig.groups.forEach((grp) => {
                for (let i = 0; i < grp.count; i++) {
                  newQ.push({
                    enemyId: grp.enemyId,
                    row: Math.floor(Math.random() * GRID_ROWS),
                    spawnTime: grp.delay + i * grp.interval,
                  });
                }
              });
              newQ.sort((a, b) => a.spawnTime - b.spawnTime);
              s.spawnQueue = newQ;
              s.waveElapsedTime = 0;
              s.currentWave += 1;
              setCurrentWave(s.currentWave);
            } else {
              // ALL WAVES CLEARED: VICTORY!
              soundManager.playVictory();
              setIsVictoryOpen(true);
              s.waveActive = false;
              setWaveActive(false);
            }
          }
        }

        // 5. Update Defenders (Shooting / Gold Generation / Melee)
        s.defenders.forEach((defender) => {
          // A. Alchemist / Miner: Generates gold periodically
          if (defender.type === 'alchemist') {
            if (nowSec - defender.lastProduceTime >= 12.0) {
              defender.lastProduceTime = nowSec;
              soundManager.playCoin();
              // Pop out gold coin
              s.fallingGolds.push({
                id: Math.random().toString(36).substring(2, 9),
                x: defender.x + 15,
                y: defender.y - 10,
                targetY: defender.y + 12,
                amount: 25,
                spawnTime: nowSec,
                lifetime: 14.0,
                isCollected: false,
              });
            }
          }

          // B. Archer, Frost Mage, Pyromancer: Line of sight check in same row!
          if (['archer', 'frost_mage', 'pyromancer'].includes(defender.type)) {
            const enemiesInLane = s.enemies.filter(
              (e) => e.row === defender.row && e.x > defender.x && e.state !== 'dead'
            );

            if (enemiesInLane.length > 0) {
              const cfg = DEFENDERS_CONFIG[defender.type];
              if (nowSec - defender.lastAttackTime >= cfg.attackInterval) {
                defender.lastAttackTime = nowSec;

                if (defender.type === 'archer') {
                  soundManager.playArrow();
                  s.projectiles.push({
                    id: Math.random().toString(36).substring(2, 9),
                    row: defender.row,
                    x: defender.x + 18,
                    y: defender.y + 2,
                    speed: 400,
                    damage: cfg.damage,
                    damageType: 'arrow',
                    color: '#f8fafc',
                    radius: 3,
                  });
                } else if (defender.type === 'frost_mage') {
                  soundManager.playFrost();
                  s.projectiles.push({
                    id: Math.random().toString(36).substring(2, 9),
                    row: defender.row,
                    x: defender.x + 18,
                    y: defender.y - 10,
                    speed: 380,
                    damage: cfg.damage,
                    damageType: 'frost',
                    color: '#38bdf8',
                    radius: 5,
                    slowDuration: 3.5,
                  });
                } else if (defender.type === 'pyromancer') {
                  soundManager.playMagic();
                  // Fire 2 rapid fireballs
                  s.projectiles.push({
                    id: Math.random().toString(36).substring(2, 9),
                    row: defender.row,
                    x: defender.x + 18,
                    y: defender.y,
                    speed: 420,
                    damage: cfg.damage,
                    damageType: 'fireball',
                    color: '#ea580c',
                    radius: 6,
                  });
                  setTimeout(() => {
                    s.projectiles.push({
                      id: Math.random().toString(36).substring(2, 9),
                      row: defender.row,
                      x: defender.x + 18,
                      y: defender.y,
                      speed: 420,
                      damage: cfg.damage,
                      damageType: 'fireball',
                      color: '#ea580c',
                      radius: 6,
                    });
                  }, 150);
                }
              }
            }
          }

          // C. Swordmaster: Melee strike
          if (defender.type === 'swordmaster') {
            const closeEnemies = s.enemies.filter(
              (e) =>
                e.row === defender.row &&
                Math.abs(e.x - defender.x) <= 45 &&
                e.state !== 'dead'
            );
            if (closeEnemies.length > 0) {
              const cfg = DEFENDERS_CONFIG.swordmaster;
              if (nowSec - defender.lastAttackTime >= cfg.attackInterval) {
                defender.lastAttackTime = nowSec;
                soundManager.playArrow();
                closeEnemies.forEach((victim) => {
                  victim.hp -= cfg.damage;
                  if (victim.hp <= 0) victim.state = 'dead';
                });
              }
            }
          }
        });

        // 6. Update Projectiles
        const activeProjectiles: Projectile[] = [];
        s.projectiles.forEach((p) => {
          p.x += p.speed * dt;

          // Check collision with frontmost enemy in this row
          const hitEnemy = s.enemies.find(
            (e) =>
              e.row === p.row &&
              e.state !== 'dead' &&
              Math.abs(e.x - p.x) <= 15
          );

          if (hitEnemy) {
            // Apply damage (Hat takes damage first!)
            if (hitEnemy.hasHat && hitEnemy.hatHp > 0) {
              hitEnemy.hatHp -= p.damage;
              if (hitEnemy.hatHp <= 0) {
                // Helmet pops off!
                soundManager.playCoin();
                for (let i = 0; i < 6; i++) {
                  s.particles.push({
                    x: hitEnemy.x,
                    y: hitEnemy.y - 20,
                    vx: Math.random() * 80 - 40,
                    vy: -(Math.random() * 80 + 30),
                    radius: 3,
                    color: hitEnemy.category === 'iron_bucket' ? '#94a3b8' : '#f97316',
                    alpha: 1,
                    maxLife: 0.5,
                    currentLife: 0,
                  });
                }
              }
            } else {
              hitEnemy.hp -= p.damage;
            }

            // Apply Frost Slow
            if (p.damageType === 'frost' && p.slowDuration) {
              hitEnemy.slowTimer = p.slowDuration;
            }

            // Floating text
            s.floatingTexts.push({
              id: Math.random().toString(),
              x: hitEnemy.x,
              y: hitEnemy.y - 15,
              text: `-${p.damage}`,
              color: p.damageType === 'frost' ? '#7dd3fc' : p.damageType === 'fireball' ? '#f97316' : '#ffffff',
              size: 11,
              alpha: 1,
              vy: -25,
              life: 0,
              maxLife: 0.6,
            });

            // Check death
            if (hitEnemy.hp <= 0 && hitEnemy.state !== 'dead') {
              hitEnemy.state = 'dead';
              s.totalKills += 1;
              s.score += hitEnemy.scoreReward;
              s.gold += hitEnemy.goldReward;
              setScore(s.score);
              setGold(s.gold);
              setTotalKills(s.totalKills);
            }
          } else if (p.x < CANVAS_WIDTH + 40) {
            activeProjectiles.push(p);
          }
        });
        s.projectiles = activeProjectiles;
        setProjectiles(activeProjectiles);

        // 7. Update Enemies (Moving, Eating Defenders, Vaulting)
        const nextEnemies: ActiveEnemy[] = [];
        s.enemies.forEach((enemy) => {
          if (enemy.state === 'dead') return;

          // Chilled speed
          let speed = enemy.baseSpeed;
          if (enemy.slowTimer > 0) {
            enemy.slowTimer = Math.max(0, enemy.slowTimer - dt);
            speed *= 0.5;
          }

          // Check if hitting a defender on the same row!
          const defenderInFront = s.defenders.find(
            (d) =>
              d.row === enemy.row &&
              enemy.x - d.x <= 25 &&
              enemy.x - d.x >= -10
          );

          // Pole Vaulter jump mechanic!
          if (
            enemy.category === 'pole_vaulter' &&
            !enemy.hasVaulted &&
            defenderInFront
          ) {
            soundManager.playUpgrade();
            enemy.hasVaulted = true;
            enemy.x -= CELL_WIDTH * 1.5; // Vaults forward!
            enemy.baseSpeed = 22; // Slower after vault
            s.floatingTexts.push({
              id: Math.random().toString(),
              x: enemy.x,
              y: enemy.y - 25,
              text: '🤾 撐竿飛躍！',
              color: '#c084fc',
              size: 13,
              alpha: 1,
              vy: -20,
              life: 0,
              maxLife: 1.0,
            });
            nextEnemies.push(enemy);
            return;
          }

          if (defenderInFront) {
            // Eating / attacking defender!
            enemy.state = 'eating';
            defenderInFront.hp -= enemy.damage * dt;

            if (defenderInFront.hp <= 0) {
              soundManager.playDefeat();
              // Defender died
              s.defenders = s.defenders.filter((d) => d.id !== defenderInFront.id);
              setDefenders(s.defenders);
              enemy.state = 'walking';
            }
          } else {
            // Walking forward
            enemy.state = 'walking';
            enemy.x -= speed * dt;
          }

          // 8. Lawnmower Trigger / Game Over Breach Check
          if (enemy.x < GRID_START_X) {
            const mower = s.lawnMowers.find((m) => m.row === enemy.row);
            if (mower && !mower.triggered) {
              // Trigger Lawnmower!
              mower.triggered = true;
              mower.active = true;
              soundManager.playWaveHorn();
              s.floatingTexts.push({
                id: Math.random().toString(),
                x: GRID_START_X,
                y: mower.y - 15,
                text: '🚜 應急戰車啟動！全線粉碎！',
                color: '#ef4444',
                size: 14,
                alpha: 1,
                vy: -20,
                life: 0,
                maxLife: 1.5,
              });
            } else if (mower && mower.triggered && !mower.active) {
              // Lawnmower already spent! Enemy breached castle!
              soundManager.playDefeat();
              setIsGameOverOpen(true);
              s.waveActive = false;
              setWaveActive(false);
              return;
            }
          }

          nextEnemies.push(enemy);
        });
        s.enemies = nextEnemies;
        setEnemies(nextEnemies);

        // 9. Update Active Lawnmowers (roll across the screen)
        s.lawnMowers.forEach((mower) => {
          if (mower.active) {
            mower.x += 420 * dt; // fast charge
            // Mow down all enemies in this row!
            s.enemies.forEach((enemy) => {
              if (enemy.row === mower.row && Math.abs(enemy.x - mower.x) <= 30) {
                enemy.state = 'dead';
                s.totalKills += 1;
                s.score += enemy.scoreReward;
                setScore(s.score);
                setTotalKills(s.totalKills);
              }
            });

            if (mower.x > CANVAS_WIDTH + 60) {
              mower.active = false;
            }
          }
        });

        // 10. Update Particles & Floating Text
        s.particles = s.particles
          .map((pt) => {
            pt.currentLife += dt;
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;
            pt.alpha = 1 - pt.currentLife / pt.maxLife;
            return pt;
          })
          .filter((pt) => pt.currentLife < pt.maxLife);
        setParticles(s.particles);

        s.floatingTexts = s.floatingTexts
          .map((ft) => {
            ft.life += dt;
            ft.y += ft.vy * dt;
            ft.alpha = 1 - ft.life / ft.maxLife;
            return ft;
          })
          .filter((ft) => ft.life < ft.maxLife);
        setFloatingTexts(s.floatingTexts);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none pb-6">
      {/* Top HUD */}
      <div className="pt-2 px-3">
        <HUD
          stageName={currentStage.name}
          currentWave={currentWave}
          totalWaves={currentStage.waves.length}
          score={score}
          gameSpeed={gameSpeed}
          isPaused={isPaused}
          soundEnabled={soundEnabled}
          isHugeWaveApproaching={isHugeWaveApproaching}
          onTogglePause={() => setIsPaused((p) => !p)}
          onChangeSpeed={(spd) => setGameSpeed(spd)}
          onToggleSound={() => {
            const next = soundManager.toggleMute();
            setSoundEnabled(next);
          }}
          onOpenBestiary={() => setIsBestiaryOpen(true)}
          onOpenStageSelect={() => setIsStageSelectOpen(true)}
          onRestart={() => resetGame()}
        />
      </div>

      {/* Main 5-Lane Battlefield Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center px-3">
        <GameCanvas
          stage={currentStage}
          defenders={defenders}
          enemies={enemies}
          projectiles={projectiles}
          fallingGolds={fallingGolds}
          lawnMowers={lawnMowers}
          particles={particles}
          floatingTexts={floatingTexts}
          selectedDefenderType={selectedDefenderType}
          isShovelActive={isShovelActive}
          onPlaceDefender={handlePlaceDefender}
          onRemoveDefender={handleRemoveDefender}
          onCollectGold={handleCollectGold}
        />

        {/* PvZ Style Defender Seed Bank Bar + Shovel */}
        <UnitSelector
          currentGold={gold}
          selectedDefenderType={selectedDefenderType}
          cardCooldowns={cardCooldowns}
          isShovelActive={isShovelActive}
          onSelectDefender={(type) => {
            setSelectedDefenderType(type);
            if (isShovelActive) setIsShovelActive(false);
          }}
          onToggleShovel={() => {
            setIsShovelActive((v) => !v);
            if (selectedDefenderType) setSelectedDefenderType(null);
          }}
        />
      </main>

      {/* Modals */}
      {isBestiaryOpen && <BestiaryModal onClose={() => setIsBestiaryOpen(false)} />}

      {isStageSelectOpen && (
        <MapSelectModal
          currentStageId={currentStage.id}
          onSelectStage={(stage) => {
            resetGame(stage);
          }}
          onClose={() => setIsStageSelectOpen(false)}
        />
      )}

      {isVictoryOpen && (
        <VictoryModal
          score={score}
          totalKills={totalKills}
          starsEarned={3}
          remainingLives={5}
          onPlayAgain={() => resetGame()}
          onNextMap={() => {
            const nextIdx = (STAGES_DATA.findIndex((s) => s.id === currentStage.id) + 1) % STAGES_DATA.length;
            resetGame(STAGES_DATA[nextIdx]);
          }}
          hasNextMap={STAGES_DATA.findIndex((s) => s.id === currentStage.id) < STAGES_DATA.length - 1}
        />
      )}

      {isGameOverOpen && (
        <GameOverModal
          currentWave={currentWave}
          totalWaves={currentStage.waves.length}
          score={score}
          totalKills={totalKills}
          onPlayAgain={() => resetGame()}
          onOpenTechTree={() => {
            setIsGameOverOpen(false);
            setIsBestiaryOpen(true);
          }}
        />
      )}
    </div>
  );
}
