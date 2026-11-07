import React from 'react';
import { DefenderType } from '../types/game';
import { DEFENDERS_CONFIG } from '../data/units';

interface UnitSelectorProps {
  currentGold: number;
  selectedDefenderType: DefenderType | null;
  cardCooldowns: Record<string, number>; // remaining seconds
  isShovelActive: boolean;
  onSelectDefender: (type: DefenderType | null) => void;
  onToggleShovel: () => void;
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({
  currentGold,
  selectedDefenderType,
  cardCooldowns,
  isShovelActive,
  onSelectDefender,
  onToggleShovel,
}) => {
  const defenderOrder: DefenderType[] = [
    'alchemist',
    'archer',
    'frost_mage',
    'paladin',
    'pyromancer',
    'swordmaster',
    'grenadier',
  ];

  return (
    <div className="w-full max-w-[960px] mx-auto mt-2 px-3 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-lg flex items-center justify-between gap-3 select-none">
      {/* Sunlight / Gold Bank Display */}
      <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-amber-500/40 shadow-inner shrink-0">
        <span className="text-2xl animate-bounce">🪙</span>
        <div className="flex flex-col">
          <span className="text-[10px] text-amber-400/80 font-bold tracking-wider uppercase">
            王國金幣
          </span>
          <span className="font-mono text-xl font-black text-amber-300 leading-none">
            {currentGold}
          </span>
        </div>
      </div>

      {/* Defender Seed Packets Cards */}
      <div className="flex items-center gap-2 flex-wrap">
        {defenderOrder.map((type, idx) => {
          const cfg = DEFENDERS_CONFIG[type];
          const cdRemaining = cardCooldowns[type] || 0;
          const isReady = cdRemaining <= 0;
          const canAfford = currentGold >= cfg.cost;
          const isSelected = selectedDefenderType === type;
          const cdRatio = cdRemaining / cfg.cooldown;

          return (
            <button
              key={type}
              onClick={() => {
                if (isSelected) {
                  onSelectDefender(null);
                } else if (isReady && canAfford) {
                  onSelectDefender(type);
                }
              }}
              disabled={(!isReady || !canAfford) && !isSelected}
              className={`relative flex flex-col items-center justify-between w-[88px] h-[68px] p-1.5 rounded-xl border transition-all overflow-hidden ${
                isSelected
                  ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400 shadow-lg scale-105'
                  : isReady && canAfford
                  ? 'bg-slate-950 hover:bg-slate-800/80 border-slate-700 hover:border-slate-500 cursor-pointer shadow-sm'
                  : 'bg-slate-950/70 border-slate-800/60 opacity-60 cursor-not-allowed'
              }`}
              title={`${cfg.name} (${cfg.cost}🪙) - ${cfg.description}`}
            >
              {/* Cooldown Mask Wipe */}
              {!isReady && (
                <div
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-10"
                  style={{
                    clipPath: `polygon(0 0, 100% 0, 100% ${Math.round(cdRatio * 100)}%, 0 ${Math.round(
                      cdRatio * 100
                    )}%)`,
                  }}
                >
                  <span className="font-mono text-xs font-black text-sky-400">
                    {cdRemaining.toFixed(1)}s
                  </span>
                </div>
              )}

              {/* Top Row: Icon + Key */}
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-xl">{cfg.icon}</span>
                <span className="font-mono text-[10px] font-bold text-slate-500 px-1 rounded bg-slate-900 border border-slate-800">
                  {idx + 1}
                </span>
              </div>

              {/* Middle: Name */}
              <span className="text-[11px] font-bold text-slate-100 truncate w-full text-center leading-tight">
                {cfg.name}
              </span>

              {/* Bottom: Cost */}
              <span
                className={`font-mono text-xs font-black ${
                  canAfford ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                🪙 {cfg.cost}
              </span>
            </button>
          );
        })}
      </div>

      {/* Shovel Tool & Cancel */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleShovel}
          className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl border transition ${
            isShovelActive
              ? 'bg-rose-950 border-rose-500 ring-2 ring-rose-400 text-rose-300 shadow-md'
              : 'bg-slate-950 hover:bg-slate-800 border-slate-700 text-slate-300'
          }`}
          title="鏟子工具 [S]：移除場上士兵並回收部分黃金"
        >
          <span className="text-xl">🪓</span>
          <span className="text-[10px] font-bold mt-0.5">鏟子 [S]</span>
        </button>

        {(selectedDefenderType || isShovelActive) && (
          <button
            onClick={() => {
              onSelectDefender(null);
              if (isShovelActive) onToggleShovel();
            }}
            className="px-2.5 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            取消 [ESC]
          </button>
        )}
      </div>
    </div>
  );
};
