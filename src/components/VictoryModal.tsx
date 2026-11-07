import React from 'react';
import { Trophy, Star, ArrowRight, RotateCcw } from 'lucide-react';

interface VictoryModalProps {
  score: number;
  totalKills: number;
  starsEarned: number;
  remainingLives: number;
  onPlayAgain: () => void;
  onNextMap: () => void;
  hasNextMap: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  totalKills,
  starsEarned,
  remainingLives,
  onPlayAgain,
  onNextMap,
  hasNextMap,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/80 rounded-2xl w-full max-w-md shadow-2xl p-6 text-slate-200 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Victory Trophy Icon */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-500/20 border border-amber-500/60 flex items-center justify-center text-3xl shadow-lg">
          <Trophy className="text-amber-400" size={32} />
        </div>

        <h2 className="text-2xl font-black text-amber-400 tracking-wide mb-1">
          戰役大捷！王國守護成功
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          所有深淵侵略者已被徹底粉碎，王國哨站固若金湯！
        </p>

        {/* Stars Awarded */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className={`p-2 rounded-xl border ${
                starIdx <= starsEarned
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-md scale-110'
                  : 'bg-slate-950 border-slate-800 text-slate-700'
              }`}
            >
              <Star size={24} fill={starIdx <= starsEarned ? '#f59e0b' : 'none'} />
            </div>
          ))}
        </div>

        {/* Stats Recap */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 mb-6 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">戰役得分</span>
            <span className="font-mono font-bold text-amber-300 text-sm">
              {score.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">殲滅敵軍</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {totalKills}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">剩餘守備力</span>
            <span className="font-mono font-bold text-rose-400 text-sm">
              {remainingLives}❤️
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            <span>再戰一場</span>
          </button>

          {hasNextMap && (
            <button
              onClick={onNextMap}
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg active:scale-95"
            >
              <span>進軍下章地圖</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
