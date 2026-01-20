import React from 'react';
import { Player, Gender, TeamSide } from '../types';
import { Trash2, User, Clock, Trophy, Pencil } from 'lucide-react';

interface TeamDisplayProps {
  players: Player[];
  onRemovePlayer: (id: string) => void;
  onEditPlayer: (player: Player) => void;
  onTeamWin: (team: 'A' | 'B') => void;
}

const TeamCard: React.FC<{
  side: TeamSide;
  players: Player[];
  onRemove: (id: string) => void;
  onEdit: (player: Player) => void;
  onWin?: (side: 'A' | 'B') => void;
  colorClass: string;
  title: string;
  icon?: React.ReactNode;
}> = ({ side, players, onRemove, onEdit, onWin, colorClass, title, icon }) => {
  const maleCount = players.filter(p => p.gender === Gender.MALE).length;
  const femaleCount = players.filter(p => p.gender === Gender.FEMALE).length;
  const isWaiting = side === 'WAITING';

  // Helper to determine title color
  const getTitleColor = () => {
    if (isWaiting) return 'text-zinc-300';
    if (side === 'A') return 'text-amber-400';
    return 'text-blue-400';
  };

  // Sort by sequence number for consistent display order within the card
  const sortedPlayers = [...players].sort((a, b) => a.sequenceNumber - b.sequenceNumber);

  return (
    <div className={`flex-1 bg-zinc-900 rounded-2xl overflow-hidden border-t-4 ${colorClass} shadow-xl flex flex-col ${isWaiting ? 'mt-6 md:mt-0' : ''}`}>
      {/* Header */}
      <div className={`p-4 border-b border-zinc-800 ${isWaiting ? 'bg-zinc-800' : 'bg-black/50'}`}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className={`text-xl md:text-2xl font-bold tracking-widest ${getTitleColor()}`}>
              {title}
            </h2>
          </div>
          <span className={`text-xl font-bold text-white px-3 py-1 rounded-lg ${isWaiting ? 'bg-black' : 'bg-zinc-800'}`}>
            {players.length}
            {!isWaiting && <span className="text-xs text-zinc-500 ml-1">/6</span>}
          </span>
        </div>
        <div className="flex gap-4 text-xs font-mono text-zinc-400 uppercase">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> {maleCount} Homens
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400"></span> {femaleCount} Mulheres
          </span>
        </div>
      </div>

      {/* List */}
      <div className={`flex-1 p-2 min-h-[200px] ${isWaiting ? 'bg-zinc-800/30' : 'bg-zinc-900/50'}`}>
        {players.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-2 opacity-50 py-8">
            <User size={32} />
            <span className="text-sm font-medium">Vazio</span>
          </div>
        ) : (
          <ul className="space-y-2">
            {sortedPlayers.map((player) => (
              <li 
                key={player.id} 
                className={`border rounded-lg p-3 flex items-center justify-between group transition-all ${isWaiting ? 'bg-black/20 border-zinc-700 hover:border-zinc-500' : 'bg-black/40 border-zinc-800 hover:border-zinc-600'}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className={`font-mono text-xl font-bold ${isWaiting ? 'text-zinc-500' : 'text-zinc-400'} min-w-[32px]`}>
                    {player.sequenceNumber.toString().padStart(2, '0')}.
                  </span>
                  <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${player.gender === Gender.MALE ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]' : 'bg-fuchsia-500 shadow-[0_0_8px_rgba(232,121,249,0.4)]'}`}></div>
                  <div className="min-w-0">
                    <span className={`block font-bold text-lg leading-tight truncate ${isWaiting ? 'text-zinc-300' : 'text-white'}`}>{player.name}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(player)}
                    className="p-2 text-zinc-500 hover:text-amber-400 transition-colors"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => onRemove(player.id)}
                    className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                    title="Remover"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer - Winner Button */}
      {!isWaiting && players.length > 0 && onWin && (
        <div className="p-3 border-t border-zinc-800 bg-black/40">
          <button
            onClick={() => onWin(side as 'A' | 'B')}
            className={`w-full py-3 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-transform active:scale-95 ${
              side === 'A' 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500'
            }`}
          >
            <Trophy size={20} className="fill-current" />
            <span>VITÓRIA</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const TeamDisplay: React.FC<TeamDisplayProps> = ({ players, onRemovePlayer, onEditPlayer, onTeamWin }) => {
  const teamAPlayers = players.filter(p => p.team === 'A');
  const teamBPlayers = players.filter(p => p.team === 'B');
  const waitingPlayers = players.filter(p => p.team === 'WAITING');

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Teams Row */}
      <div className="flex flex-col md:flex-row gap-6 w-full">
        <TeamCard 
          side="A" 
          title="TIME A" 
          players={teamAPlayers} 
          onRemove={onRemovePlayer}
          onEdit={onEditPlayer}
          onWin={onTeamWin}
          colorClass="border-amber-500" 
        />
        
        {/* VS Badge for desktop */}
        <div className="hidden md:flex flex-col justify-center items-center">
          <div className="bg-zinc-800 text-zinc-500 font-bold rounded-full w-10 h-10 flex items-center justify-center border-2 border-zinc-700">
            VS
          </div>
        </div>

        <TeamCard 
          side="B" 
          title="TIME B" 
          players={teamBPlayers} 
          onRemove={onRemovePlayer}
          onEdit={onEditPlayer}
          onWin={onTeamWin}
          colorClass="border-blue-500" 
        />
      </div>

      {/* Waiting List Row */}
      <div className="w-full">
        <TeamCard 
          side="WAITING" 
          title="LISTA DE ESPERA" 
          players={waitingPlayers} 
          onRemove={onRemovePlayer}
          onEdit={onEditPlayer} 
          colorClass="border-zinc-500"
          icon={<Clock className="text-zinc-400" size={24} />}
        />
      </div>
    </div>
  );
};