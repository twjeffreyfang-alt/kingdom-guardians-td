import React, { useRef, useEffect, useCallback } from 'react';
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
} from '../types/game';
import { DEFENDERS_CONFIG, ENEMIES_CONFIG } from '../data/units';
import { soundManager } from '../utils/audio';

interface GameCanvasProps {
  stage: GameStage;
  defenders: PlacedDefender[];
  enemies: ActiveEnemy[];
  projectiles: Projectile[];
  fallingGolds: FallingGold[];
  lawnMowers: LawnMower[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  selectedDefenderType: DefenderType | null;
  isShovelActive: boolean;
  onPlaceDefender: (row: number, col: number) => void;
  onRemoveDefender: (row: number, col: number) => void;
  onCollectGold: (goldId: string) => void;
}

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;

export const GRID_ROWS = 5;
export const GRID_COLS = 9;

export const GRID_START_X = 180;
export const GRID_START_Y = 75;
export const CELL_WIDTH = 80;
export const CELL_HEIGHT = 86;

export function getCellCenter(row: number, col: number) {
  return {
    x: GRID_START_X + col * CELL_WIDTH + CELL_WIDTH / 2,
    y: GRID_START_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2,
  };
}

export function getRowY(row: number) {
  return GRID_START_Y + row * CELL_HEIGHT + CELL_HEIGHT / 2;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  stage,
  defenders,
  enemies,
  projectiles,
  fallingGolds,
  lawnMowers,
  particles,
  floatingTexts,
  selectedDefenderType,
  isShovelActive,
  onPlaceDefender,
  onRemoveDefender,
  onCollectGold,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = React.useState<{ x: number; y: number } | null>(null);

  // Mouse coordinate tracker
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    setMousePos({
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos(null);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      // 1. Check clicking falling gold/sun first!
      for (const gold of fallingGolds) {
        if (!gold.isCollected) {
          const dist = Math.hypot(x - gold.x, y - gold.y);
          if (dist <= 30) {
            onCollectGold(gold.id);
            return;
          }
        }
      }

      // 2. Check grid interaction
      if (
        x >= GRID_START_X &&
        x < GRID_START_X + GRID_COLS * CELL_WIDTH &&
        y >= GRID_START_Y &&
        y < GRID_START_Y + GRID_ROWS * CELL_HEIGHT
      ) {
        const col = Math.floor((x - GRID_START_X) / CELL_WIDTH);
        const row = Math.floor((y - GRID_START_Y) / CELL_HEIGHT);

        if (isShovelActive) {
          onRemoveDefender(row, col);
        } else if (selectedDefenderType) {
          onPlaceDefender(row, col);
        }
      }
    },
    [fallingGolds, isShovelActive, onCollectGold, onPlaceDefender, onRemoveDefender, selectedDefenderType]
  );

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const now = performance.now();

      // 1. Draw Castle Lawn Background
      // Left Castle Porch
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, GRID_START_X, CANVAS_HEIGHT);

      // Castle brick pattern on left
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      for (let y = 0; y < CANVAS_HEIGHT; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(GRID_START_X, y);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(GRID_START_X, 0);
      ctx.lineTo(GRID_START_X, CANVAS_HEIGHT);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#475569';
      ctx.stroke();

      // Castle banner flag
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏰', 50, 40);
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('王國堡壘', 100, 38);

      // Right Lawn & Top Sky
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(GRID_START_X, 0, CANVAS_WIDTH - GRID_START_X, GRID_START_Y);

      // Draw 5x9 Checkerboard Lawn Grid
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const cx = GRID_START_X + c * CELL_WIDTH;
          const cy = GRID_START_Y + r * CELL_HEIGHT;

          // Checkerboard green pattern
          const isLight = (r + c) % 2 === 0;
          ctx.fillStyle = isLight ? stage.theme.lawnLight : stage.theme.lawnDark;
          ctx.fillRect(cx, cy, CELL_WIDTH, CELL_HEIGHT);

          // Subtle grass blade details
          ctx.fillStyle = isLight ? '#16a34a' : '#15803d';
          ctx.fillRect(cx + 10, cy + 12, 3, 6);
          ctx.fillRect(cx + 45, cy + 50, 3, 5);
          ctx.fillRect(cx + 65, cy + 20, 2, 5);

          // Cell hairline divider
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
          ctx.lineWidth = 1;
          ctx.strokeRect(cx, cy, CELL_WIDTH, CELL_HEIGHT);
        }
      }

      // Lane separator lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 2;
      for (let r = 0; r <= GRID_ROWS; r++) {
        const y = GRID_START_Y + r * CELL_HEIGHT;
        ctx.beginPath();
        ctx.moveTo(GRID_START_X, y);
        ctx.lineTo(GRID_START_X + GRID_COLS * CELL_WIDTH, y);
        ctx.stroke();
      }

      // 2. Draw Hover Placement Highlight
      if (mousePos) {
        if (
          mousePos.x >= GRID_START_X &&
          mousePos.x < GRID_START_X + GRID_COLS * CELL_WIDTH &&
          mousePos.y >= GRID_START_Y &&
          mousePos.y < GRID_START_Y + GRID_ROWS * CELL_HEIGHT
        ) {
          const col = Math.floor((mousePos.x - GRID_START_X) / CELL_WIDTH);
          const row = Math.floor((mousePos.y - GRID_START_Y) / CELL_HEIGHT);
          const cx = GRID_START_X + col * CELL_WIDTH;
          const cy = GRID_START_Y + row * CELL_HEIGHT;

          const occupied = defenders.some((d) => d.row === row && d.col === col);

          if (isShovelActive) {
            ctx.fillStyle = occupied ? 'rgba(239, 68, 68, 0.35)' : 'rgba(100, 116, 139, 0.2)';
            ctx.fillRect(cx, cy, CELL_WIDTH, CELL_HEIGHT);
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.strokeRect(cx, cy, CELL_WIDTH, CELL_HEIGHT);
          } else if (selectedDefenderType) {
            ctx.fillStyle = occupied ? 'rgba(239, 68, 68, 0.3)' : 'rgba(74, 222, 128, 0.35)';
            ctx.fillRect(cx, cy, CELL_WIDTH, CELL_HEIGHT);
            ctx.strokeStyle = occupied ? '#ef4444' : '#4ade80';
            ctx.lineWidth = 3;
            ctx.strokeRect(cx, cy, CELL_WIDTH, CELL_HEIGHT);

            // Preview icon
            const cfg = DEFENDERS_CONFIG[selectedDefenderType];
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(cfg.icon, cx + CELL_WIDTH / 2, cy + CELL_HEIGHT / 2);
          }
        }
      }

      // 3. Draw 5 Royal Lawnmowers (Emergency Defense Carts)
      lawnMowers.forEach((mower) => {
        if (mower.triggered && !mower.active) return; // spent

        ctx.save();
        ctx.translate(mower.x, mower.y);

        // Cart body
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-18, -14, 36, 28);
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 2;
        ctx.strokeRect(-18, -14, 36, 28);

        // Gold Trim
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-12, -4, 24, 8);

        // Wheels
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(-14, 14, 6, 0, Math.PI * 2);
        ctx.arc(14, 14, 6, 0, Math.PI * 2);
        ctx.fill();

        // Cutting blade rotating if active
        if (mower.active) {
          ctx.save();
          ctx.rotate(now / 50);
          ctx.strokeStyle = '#f8fafc';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-16, 0);
          ctx.lineTo(16, 0);
          ctx.moveTo(0, -16);
          ctx.lineTo(0, 16);
          ctx.stroke();
          ctx.restore();
        }

        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚜', 0, 0);

        ctx.restore();
      });

      // 4. Draw Human Defenders (Distinctive Humanoid Characters)
      defenders.forEach((defender) => {
        ctx.save();
        ctx.translate(defender.x, defender.y);

        // Gentle breathing bobbing animation
        const bob = Math.sin((now / 300) + defender.col * 0.5) * 2;
        ctx.translate(0, bob);

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 24, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // DRAW CHARACTER BASED ON DEFENDER TYPE
        if (defender.type === 'archer') {
          // --- 王國長弓手 (Royal Human Archer) ---
          // Cape
          ctx.fillStyle = '#047857';
          ctx.beginPath();
          ctx.moveTo(-12, 0);
          ctx.lineTo(-18, 22);
          ctx.lineTo(6, 22);
          ctx.lineTo(8, 0);
          ctx.closePath();
          ctx.fill();

          // Torso / Tunic
          ctx.fillStyle = '#10b981';
          ctx.fillRect(-10, -4, 20, 24);
          // Belt
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-10, 8, 20, 4);
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(-3, 7, 6, 6);

          // Head (Human face)
          ctx.fillStyle = '#fed7aa'; // skin tone
          ctx.beginPath();
          ctx.arc(0, -14, 10, 0, Math.PI * 2);
          ctx.fill();

          // Eyes
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(2, -16, 3, 4);

          // Archer Cap & Golden Feather
          ctx.fillStyle = '#065f46';
          ctx.beginPath();
          ctx.moveTo(-12, -18);
          ctx.lineTo(12, -18);
          ctx.lineTo(0, -28);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(8, -20);
          ctx.lineTo(16, -30);
          ctx.lineTo(10, -24);
          ctx.closePath();
          ctx.fill();

          // Wooden Recurve Bow in hands
          ctx.strokeStyle = '#92400e';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(14, 2, 16, -Math.PI / 3, Math.PI / 3);
          ctx.stroke();
          // Bowstring & Arrow
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(6, -12);
          ctx.lineTo(6, 16);
          ctx.stroke();

          // Arrow resting
          ctx.strokeStyle = '#f8fafc';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 2);
          ctx.lineTo(20, 2);
          ctx.stroke();
        } else if (defender.type === 'paladin') {
          // --- 聖殿重甲騎士 (Paladin with Greatshield) ---
          // Knight body plate armor
          ctx.fillStyle = '#64748b';
          ctx.fillRect(-12, -4, 24, 28);
          // Red Tabard
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(-5, -4, 10, 26);

          // Helmet (Silver Knight Helm with Visor)
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.arc(0, -14, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Helmet plume
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(0, -24);
          ctx.lineTo(6, -34);
          ctx.lineTo(-4, -30);
          ctx.closePath();
          ctx.fill();

          // Visor slit
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-4, -15, 12, 3);

          // Giant Heraldic Tower Shield in front!
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(8, -12, 16, 36);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.strokeRect(8, -12, 16, 36);

          // Golden Lion/Cross emblem on shield
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(14, -8, 4, 28);
          ctx.fillRect(10, -2, 12, 4);

          // Shield crack indicators when HP decreases
          const hpRatio = defender.hp / defender.maxHp;
          if (hpRatio < 0.66) {
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(10, 5);
            ctx.lineTo(16, 12);
            ctx.stroke();
          }
          if (hpRatio < 0.33) {
            ctx.beginPath();
            ctx.moveTo(14, -4);
            ctx.lineTo(20, 2);
            ctx.lineTo(16, 8);
            ctx.stroke();
          }
        } else if (defender.type === 'alchemist') {
          // --- 皇家鍊金工 (Royal Alchemist / Miner) ---
          // Leather Work Apron
          ctx.fillStyle = '#b45309';
          ctx.fillRect(-10, -2, 20, 26);

          // Head & Face
          ctx.fillStyle = '#fed7aa';
          ctx.beginPath();
          ctx.arc(0, -13, 9, 0, Math.PI * 2);
          ctx.fill();

          // Eyes & Smile
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(1, -15, 2, 3);
          ctx.beginPath();
          ctx.arc(2, -10, 3, 0, Math.PI);
          ctx.stroke();

          // Leather cap with golden goggles
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-9, -21, 18, 8);
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(-3, -19, 4, 0, Math.PI * 2);
          ctx.arc(5, -19, 4, 0, Math.PI * 2);
          ctx.fill();

          // Gold Pan / Pickaxe in hand
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(8, 0);
          ctx.lineTo(18, -10);
          ctx.stroke();
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.arc(18, -10, 6, 0, Math.PI * 2);
          ctx.fill();

          // Pulsing Golden glow aura when producing gold
          const producePulse = (Math.sin(now / 200) + 1) * 0.5;
          ctx.fillStyle = `rgba(251, 191, 36, ${0.15 + producePulse * 0.25})`;
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI * 2);
          ctx.fill();
        } else if (defender.type === 'frost_mage') {
          // --- 寒霜魔女 (Cryomancer) ---
          // Long flowing sapphire gown
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.moveTo(-10, -2);
          ctx.lineTo(-14, 24);
          ctx.lineTo(14, 24);
          ctx.lineTo(10, -2);
          ctx.closePath();
          ctx.fill();

          // Skin & Ice-Blue Hair
          ctx.fillStyle = '#fed7aa';
          ctx.beginPath();
          ctx.arc(0, -14, 9, 0, Math.PI * 2);
          ctx.fill();

          // Long Cyan Hair
          ctx.fillStyle = '#7dd3fc';
          ctx.beginPath();
          ctx.arc(0, -16, 10, Math.PI, Math.PI * 2);
          ctx.lineTo(-8, 4);
          ctx.lineTo(8, 4);
          ctx.closePath();
          ctx.fill();

          // Ice Tiara Crown
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(-6, -22);
          ctx.lineTo(0, -28);
          ctx.lineTo(6, -22);
          ctx.closePath();
          ctx.fill();

          // Frost Staff with rotating diamond crystal
          ctx.strokeStyle = '#e0f2fe';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(10, 16);
          ctx.lineTo(16, -16);
          ctx.stroke();

          // Floating Ice Crystal
          ctx.save();
          ctx.translate(16, -20);
          ctx.rotate(now / 400);
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(0, -8);
          ctx.lineTo(6, 0);
          ctx.lineTo(0, 8);
          ctx.lineTo(-6, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else if (defender.type === 'pyromancer') {
          // --- 烈焰魔導士 (Pyromancer) ---
          // Red Mage Robes
          ctx.fillStyle = '#b91c1c';
          ctx.fillRect(-10, -2, 20, 26);

          // Head & Flame Hood
          ctx.fillStyle = '#fed7aa';
          ctx.beginPath();
          ctx.arc(0, -14, 9, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.moveTo(-10, -12);
          ctx.lineTo(0, -28);
          ctx.lineTo(10, -12);
          ctx.closePath();
          ctx.fill();

          // Fireballs orbiting hands
          const fAngle = now / 250;
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(14 + Math.cos(fAngle) * 5, 2 + Math.sin(fAngle) * 5, 6, 0, Math.PI * 2);
          ctx.arc(14 + Math.cos(fAngle + Math.PI) * 5, 2 + Math.sin(fAngle + Math.PI) * 5, 6, 0, Math.PI * 2);
          ctx.fill();
        } else if (defender.type === 'swordmaster') {
          // --- 王國劍術大師 (Swordmaster) ---
          ctx.fillStyle = '#312e81';
          ctx.fillRect(-10, -2, 20, 26);
          ctx.fillStyle = '#fed7aa';
          ctx.beginPath();
          ctx.arc(0, -14, 9, 0, Math.PI * 2);
          ctx.fill();

          // Headband
          ctx.fillStyle = '#818cf8';
          ctx.fillRect(-9, -18, 18, 4);

          // Gleaming Katana / Longsword
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(4, 8);
          ctx.lineTo(24, -8);
          ctx.stroke();
        } else {
          // Bombardier
          ctx.font = '24px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💣', 0, 0);
        }

        // Health Bar (if damaged)
        if (defender.hp < defender.maxHp) {
          const hpW = 34;
          const hpH = 4;
          const hpPct = Math.max(0, defender.hp / defender.maxHp);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(-hpW / 2, 26, hpW, hpH);
          ctx.fillStyle = hpPct > 0.5 ? '#22c55e' : hpPct > 0.2 ? '#f59e0b' : '#ef4444';
          ctx.fillRect(-hpW / 2, 26, hpW * hpPct, hpH);
        }

        ctx.restore();
      });

      // 5. Draw Humanoid Invaders (Zombies / Dark Raiders)
      enemies.forEach((enemy) => {
        if (enemy.state === 'dead') return;

        ctx.save();
        ctx.translate(enemy.x, enemy.y);

        // Walking leg swing & torso bob
        const walkCycle = Math.sin((enemy.x / 14) + enemy.row);
        const legAngle = walkCycle * 0.4;
        const bob = Math.abs(walkCycle) * 2;
        ctx.translate(0, -bob);

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 24, enemy.category === 'ogre_giant' ? 30 : 16, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Chilled / Frozen visual tint
        if (enemy.freezeTimer > 0) {
          ctx.fillStyle = 'rgba(186, 230, 253, 0.8)';
          ctx.fillRect(-20, -32, 40, 56);
          ctx.strokeStyle = '#0284c7';
          ctx.strokeRect(-20, -32, 40, 56);
        }

        // Draw Legs
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        // Left leg
        ctx.beginPath();
        ctx.moveTo(-4, 12);
        ctx.lineTo(-4 + Math.sin(legAngle) * 10, 24);
        ctx.stroke();
        // Right leg
        ctx.beginPath();
        ctx.moveTo(4, 12);
        ctx.lineTo(4 - Math.sin(legAngle) * 10, 24);
        ctx.stroke();

        // Draw Torso
        ctx.fillStyle = enemy.category === 'ogre_giant' ? '#7f1d1d' : '#475569';
        const torsoW = enemy.category === 'ogre_giant' ? 32 : 18;
        const torsoH = enemy.category === 'ogre_giant' ? 36 : 22;
        ctx.fillRect(-torsoW / 2, -4, torsoW, torsoH);

        // Outstretched Zombie Arms
        ctx.strokeStyle = enemy.category === 'ogre_giant' ? '#991b1b' : '#64748b';
        ctx.lineWidth = enemy.category === 'ogre_giant' ? 6 : 3.5;
        ctx.beginPath();
        ctx.moveTo(-4, 2);
        ctx.lineTo(-18, 6);
        ctx.stroke();

        // Head (Pale zombie face)
        const headR = enemy.category === 'ogre_giant' ? 16 : 9;
        ctx.fillStyle = enemy.slowTimer > 0 ? '#7dd3fc' : '#86efac'; // pale zombie skin
        ctx.beginPath();
        ctx.arc(0, -12, headR, 0, Math.PI * 2);
        ctx.fill();

        // Zombie Eyes & Mouth
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-6, -15, 3, 3);
        ctx.fillRect(-1, -15, 3, 3);

        // HATS (Cone or Iron Bucket)
        if (enemy.hasHat && enemy.hatHp > 0) {
          if (enemy.category === 'cone_raider') {
            // Orange Traffic Cone / Horned Cap
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.moveTo(-9, -16);
            ctx.lineTo(9, -16);
            ctx.lineTo(0, -34);
            ctx.closePath();
            ctx.fill();
            // White stripe
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-4, -26, 8, 3);
          } else if (enemy.category === 'iron_bucket') {
            // Sturdy Iron Bucket
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(-8, -28, 16, 16);
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-8, -28, 16, 16);
            // Bucket handle
            ctx.strokeStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.arc(0, -20, 10, Math.PI, 0);
            ctx.stroke();
          }
        }

        // Vaulting Pole for Pole Vaulter
        if (enemy.category === 'pole_vaulter' && !enemy.hasVaulted) {
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(12, 18);
          ctx.lineTo(-24, -18);
          ctx.stroke();
        }

        // Giant Club for Ogre
        if (enemy.category === 'ogre_giant') {
          ctx.fillStyle = '#27272a';
          ctx.fillRect(-28, -20, 14, 40);
          ctx.strokeStyle = '#71717a';
          ctx.strokeRect(-28, -20, 14, 40);
        }

        // Health Bar
        const barW = enemy.category === 'ogre_giant' ? 44 : 26;
        const barH = 4;
        const totalHp = enemy.maxHp + (enemy.hasHat ? enemy.maxHatHp : 0);
        const curHp = enemy.hp + (enemy.hasHat ? Math.max(0, enemy.hatHp) : 0);
        const pct = Math.max(0, curHp / totalHp);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(-barW / 2, -26, barW, barH);
        ctx.fillStyle = enemy.category === 'ogre_giant' ? '#eab308' : pct > 0.4 ? '#ef4444' : '#b91c1c';
        ctx.fillRect(-barW / 2, -26, barW * pct, barH);

        ctx.restore();
      });

      // 6. Draw Projectiles (Arrows, Fireballs, Ice Shards)
      projectiles.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);

        if (p.damageType === 'arrow') {
          // Sharp arrow
          ctx.strokeStyle = '#f8fafc';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-12, 0);
          ctx.lineTo(8, 0);
          ctx.stroke();
          // Arrowhead
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.moveTo(8, -4);
          ctx.lineTo(14, 0);
          ctx.lineTo(8, 4);
          ctx.closePath();
          ctx.fill();
        } else if (p.damageType === 'frost') {
          // Ice shard
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, p.radius * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.damageType === 'fireball') {
          // Fireball with smoke tail
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(2, 0, p.radius * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // 7. Draw Falling Sun / Gold Coins (Plants vs Zombies Sunlight equivalent)
      fallingGolds.forEach((gold) => {
        if (gold.isCollected) return;

        ctx.save();
        ctx.translate(gold.x, gold.y);

        // Radiant sunlight / gold sparkle ring
        const pulse = (Math.sin((now / 200) + gold.x) + 1) * 0.5;
        ctx.fillStyle = `rgba(251, 191, 36, ${0.25 + pulse * 0.25})`;
        ctx.beginPath();
        ctx.arc(0, 0, 22 + pulse * 4, 0, Math.PI * 2);
        ctx.fill();

        // Gold coin
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🪙', 0, 0);

        ctx.restore();
      });

      // 8. Draw Particles
      particles.forEach((pt) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 9. Draw Floating Combat Text
      floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = `bold ${ft.size}px monospace`;
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    defenders,
    enemies,
    fallingGolds,
    floatingTexts,
    isShovelActive,
    lawnMowers,
    mousePos,
    particles,
    projectiles,
    selectedDefenderType,
    stage,
  ]);

  return (
    <div className="relative w-full max-w-[960px] aspect-[16/9] mx-auto rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-slate-950 select-none">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="w-full h-full block cursor-pointer"
      />
    </div>
  );
};
