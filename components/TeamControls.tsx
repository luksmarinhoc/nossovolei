import React from 'react';
import { Shuffle, FlaskConical } from 'lucide-react';

interface TeamControlsProps {
  playerCount: number;
  onGenerate: () => void;
  onAddRandom: () => void;
}

export const TeamControls: React.FC<TeamControlsProps> = ({
  playerCount,
  onGenerate,
  onAddRandom
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
      <button
        type="button"
        onClick={onAddRandom}
        className="w-full bg-indigo-900/40 hover:bg-indigo-800 border-2 border-indigo-900/50 hover:border-indigo-500 text-indigo-200 hover:text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <FlaskConical size={20} className="pointer-events-none" />
        <span className="pointer-events-none">ADICIONAR JOGADOR TESTE (+1)</span>
      </button>
    </div>
  );
};