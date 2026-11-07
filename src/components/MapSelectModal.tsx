import React from 'react';
import { GameStage } from '../types/game';
import { STAGES_DATA } from '../data/units';
import { X, MapPin, CheckCircle } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface StageSelectModalProps {
  currentStageId: string;
  onSelectStage: (stage: GameStage) => void;
  onClose: () => void;
}

export const MapSelectModal: React.FC<StageSelectModalProps> = ({
  currentStageId,
  onSelectStage,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl">
              <MapPin className="text-emerald-400" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">選擇防守戰場</h3>
              <p className="text-xs text-slate-400">挑選守衛草坪戰線，抵禦深淵入侵</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stage List */}
        <div className="space-y-3">
          {STAGES_DATA.map((stg) => {
            const isSelected = stg.id === currentStageId;
            return (
              <div
                key={stg.id}
                onClick={() => {
                  soundManager.playUpgrade();
                  onSelectStage(stg);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-400 ring-2 ring-emerald-400/30 shadow-lg'
                    : 'bg-slate-950/70 hover:bg-slate-800/60 border-slate-700/80 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-slate-100">{stg.name}</h4>
                      {isSelected && (
                        <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                          <CheckCircle size={13} />
                          <span>當前戰場</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-emerald-400 font-medium block mt-0.5">
                      {stg.subtitle}
                    </span>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                      <span>初始金幣: {stg.startingGold}🪙</span>
                      <span>·</span>
                      <span>總波次: {stg.waves.length} 波</span>
                      <span>·</span>
                      <span>5 條防禦路徑</span>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg transition text-slate-200">
                    出征
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
