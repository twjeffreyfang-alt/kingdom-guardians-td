import React, { useState } from 'react';
import { DEFENDERS_CONFIG, ENEMIES_CONFIG } from '../data/units';
import { DefenderType, EnemyCategory } from '../types/game';
import { X, Shield, Swords, Sparkles } from 'lucide-react';

interface BestiaryModalProps {
  onClose: () => void;
}

export const BestiaryModal: React.FC<BestiaryModalProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'defenders' | 'enemies'>('defenders');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl p-6 text-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-100 text-lg">王國戰術手冊</h3>
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                onClick={() => setTab('defenders')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  tab === 'defenders'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                王國人類守護者
              </button>
              <button
                onClick={() => setTab('enemies')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  tab === 'enemies'
                    ? 'bg-amber-400 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                深淵侵略者圖鑑
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {tab === 'defenders' ? (
            Object.values(DEFENDERS_CONFIG).map((def) => (
              <div
                key={def.id}
                className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 flex items-start gap-3.5"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-inner"
                  style={{ backgroundColor: `${def.color}25`, border: `1px solid ${def.color}60` }}
                >
                  {def.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-100">{def.name}</h4>
                      <span className="text-[10px] font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {def.role}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      🪙 {def.cost}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{def.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400 font-mono">
                    <span>生命值: {def.hp}</span>
                    <span>·</span>
                    <span>攻擊傷害: {def.damage > 0 ? def.damage : '無 (純防禦/生產)'}</span>
                    <span>·</span>
                    <span>冷卻時間: {def.cooldown}秒</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            Object.values(ENEMIES_CONFIG).map((en) => (
              <div
                key={en.id}
                className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 flex items-start gap-3.5"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-inner"
                  style={{ backgroundColor: `${en.color}25`, border: `1px solid ${en.color}60` }}
                >
                  {en.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-100">{en.name}</h4>
                      {en.isBoss && (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-700/60">
                          狂暴首領
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      擊敗獎勵: +{en.goldReward}🪙
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{en.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400 font-mono">
                    <span>基礎生命: {en.hp}</span>
                    {en.hasHat && (
                      <>
                        <span>·</span>
                        <span>裝甲頭盔值: {en.hatHp}</span>
                      </>
                    )}
                    <span>·</span>
                    <span>移動速度: {en.speed}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
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
