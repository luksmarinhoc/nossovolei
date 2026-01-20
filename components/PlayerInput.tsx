import React, { useState } from 'react';
import { Plus, User } from 'lucide-react';
import { Gender } from '../types';

interface PlayerInputProps {
  onAddPlayer: (name: string, gender: Gender) => void;
}

export const PlayerInput: React.FC<PlayerInputProps> = ({ onAddPlayer }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.MALE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddPlayer(name.trim().toUpperCase(), gender);
    setName('');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value.toUpperCase());
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 p-4 rounded-xl shadow-lg border border-zinc-800 mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-grow relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-zinc-500" />
          </div>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="NOME DO JOGADOR(A)"
            className="pl-10 w-full p-3 bg-black border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all text-white placeholder-zinc-500 uppercase"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="p-3 bg-black border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-white appearance-none"
            style={{ minWidth: '120px' }}
          >
            <option value={Gender.MALE}>Homem</option>
            <option value={Gender.FEMALE}>Mulher</option>
          </select>

          <button
            type="submit"
            disabled={!name.trim()}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors min-w-[120px] justify-center uppercase tracking-wide"
          >
            <Plus size={20} />
            <span>Adicionar</span>
          </button>
        </div>
      </div>
    </form>
  );
};