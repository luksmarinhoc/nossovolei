import React from 'react';
import { Shuffle, FlaskConical, Trash2 } from 'lucide-react';

interface TeamControlsProps {
  playerCount: number;
  onGenerate: () => void;
  onAddRandom: () => void;
  onReset: () => void;
}

export const TeamControls: React.FC<TeamControlsProps> = ({
  playerCount,
  onGenerate,
  onAddRandom,
  onReset
}) => {
  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Main Action */}
      <button
        type="button"
        onClick={onGenerate}
        disabled={playerCount < 2}
        className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-3 transform active:scale-95 transition-all uppercase tracking-wide text-lg"
      >
        <Shuffle size={24} className="pointer-events-none" />
        <span className="pointer-events-none">MISTURAR EQUIPES</span>
      </button>

      {/* Secondary Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onAddRandom}
          className="w-full bg-indigo-900/40 hover:bg-indigo-800 border-2 border-indigo-900/50 hover:border-indigo-500 text-indigo-200 hover:text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm sm:text-base"
        >
          <FlaskConical size={20} className="pointer-events-none" />
          <span className="pointer-events-none">ADD TESTE (+1)</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full bg-red-950/30 hover:bg-red-900/50 border-2 border-red-900/50 hover:border-red-500 text-red-500 hover:text-red-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm sm:text-base uppercase"
        >
          <Trash2 size={20} className="pointer-events-none" />
          <span className="pointer-events-none">RESETAR APLICATIVO</span>
        </button>
      </div>
    </div>
  );
};