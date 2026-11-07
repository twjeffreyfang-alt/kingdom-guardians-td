import React from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  BookOpen,
  Map,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface HUDProps {
  stageName: string;
  currentWave: number;
  totalWaves: number;
  score: number;
  gameSpeed: number;
  isPaused: boolean;
  soundEnabled: boolean;
  isHugeWaveApproaching: boolean;
  onTogglePause: () => void;
  onChangeSpeed: (spd: number) => void;
  onToggleSound: () => void;
  onOpenBestiary: () => void;
  onOpenStageSelect: () => void;
  onRestart: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stageName,
  currentWave,
  totalWaves,
  score,
  gameSpeed,
  isPaused,
  soundEnabled,
  isHugeWaveApproaching,
  onTogglePause,
  onChangeSpeed,
  onToggleSound,
  onOpenBestiary,
  onOpenStageSelect,
  onRestart,
}) => {
  const waveProgress = Math.min(100, Math.round((currentWave / Math.max(1, totalWaves)) * 100));

  return (
    <div className="w-full max-w-[960px] mx-auto mb-2 px-3 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-lg flex items-center justify-between gap-3 text-sm select-none">
      {/* Zone 1: Title & Stage */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-black text-amber-400 text-base">
          <span>⚔️</span>
          <span>王國守護者</span>
          <span className="text-xs font-normal text-slate-400 ml-1">/ {stageName}</span>
        </div>
      </div>

      {/* Zone 2: Zombie / Wave Progress Bar (Classic PvZ Style!) */}
      <div className="flex-1 max-w-xs mx-2">
        <div className="flex justify-between items-center text-[11px] mb-1">
          <span className="text-slate-400 font-medium">深淵進軍進度</span>
          <span className="font-mono font-bold text-sky-400">
            波次 {currentWave} / {totalWaves}
          </span>
        </div>
        <div className="w-full h-3 bg-slate-950 rounded-full border border-slate-700/80 overflow-hidden relative shadow-inner">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isHugeWaveApproaching ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
            }`}
            style={{ width: `${waveProgress}%` }}
          />
          {/* Flag indicator at 50% and 100% */}
          <span className="absolute right-1 top-0 text-[10px] leading-3" title="最終波次">
            🚩
          </span>
        </div>
      </div>

      {/* Zone 3: Score & Controls */}
      <div className="flex items-center gap-3">
        <div className="text-xs text-slate-300 font-mono">
          <span className="text-slate-400 mr-1">得分:</span>
          <span className="font-bold text-amber-300">{score.toLocaleString()}</span>
        </div>

        {/* Speed Segmented Control */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={onTogglePause}
            className={`p-1.5 rounded-md transition text-xs ${
              isPaused ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="暫停 / 繼續 (空白鍵)"
          >
            {isPaused ? <Play size={13} /> : <Pause size={13} />}
          </button>
          {[1, 2, 3].map((spd) => (
            <button
              key={spd}
              onClick={() => onChangeSpeed(spd)}
              className={`px-2 py-0.5 text-xs font-mono font-bold rounded-md transition ${
                gameSpeed === spd && !isPaused
                  ? 'bg-sky-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Menu Buttons */}
        <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
          <button
            onClick={onOpenBestiary}
            className="p-1.5 text-slate-400 hover:text-sky-300 hover:bg-slate-800 rounded-lg transition"
            title="英雄與敵人圖鑑"
          >
            <BookOpen size={16} />
          </button>
          <button
            onClick={onOpenStageSelect}
            className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition"
            title="更換戰役關卡"
          >
            <Map size={16} />
          </button>
          <button
            onClick={onToggleSound}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            title={soundEnabled ? '靜音' : '開啟音效'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            onClick={onRestart}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
            title="重新開始此關卡"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
