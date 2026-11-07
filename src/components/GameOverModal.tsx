import React from 'react';
import { Skull, RotateCcw, Sparkles } from 'lucide-react';

interface GameOverModalProps {
  currentWave: number;
  totalWaves: number;
  score: number;
  totalKills: number;
  onPlayAgain: () => void;
  onOpenTechTree: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  currentWave,
  totalWaves,
  score,
  totalKills,
  onPlayAgain,
  onOpenTechTree,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-rose-800/80 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-200 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Skull Icon */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-rose-950/60 border border-rose-800 flex items-center justify-center text-3xl shadow-lg">
          <Skull className="text-rose-500" size={32} />
        </div>

        <h2 className="text-2xl font-black text-rose-500 tracking-wide mb-1">
          城堡陷落！戰役失敗
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          守備陣線被深淵大軍衝破，王國需要重整戰備再次奮戰！
        </p>

        {/* Stats Recap */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 mb-6 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">防守進度</span>
            <span className="font-mono font-bold text-sky-400 text-sm">
              波次 {currentWave} / {totalWaves}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">累計得分</span>
            <span className="font-mono font-bold text-amber-300 text-sm">
              {score.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">殲滅數</span>
            <span className="font-mono font-bold text-slate-200 text-sm">
              {totalKills}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenTechTree}
            className="flex-1 py-2.5 px-3 rounded-xl border border-amber-800/60 bg-amber-950/40 hover:bg-amber-900/40 text-xs font-semibold text-amber-300 transition flex items-center justify-center gap-1.5"
          >
            <Sparkles size={14} />
            <span>科技天賦升級</span>
          </button>

          <button
            onClick={onPlayAgain}
            className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg active:scale-95"
          >
            <RotateCcw size={14} />
            <span>重新挑戰</span>
          </button>
        </div>
      </div>
    </div>
  );
};
