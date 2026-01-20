import React, { useState, useEffect } from 'react';
import { X, Save, User } from 'lucide-react';
import { Player, Gender } from '../types';

interface EditPlayerModalProps {
  isOpen: boolean;
  player: Player | null;
  onClose: () => void;
  onSave: (id: string, name: string, gender: Gender) => void;
}

export const EditPlayerModal: React.FC<EditPlayerModalProps> = ({
  isOpen,
  player,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.MALE);

  useEffect(() => {
    if (player) {
      setName(player.name);
      setGender(player.gender);
    }
  }, [player]);

  if (!isOpen || !player) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(player.id, name.trim().toUpperCase(), gender);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-zinc-800 p-4 border-b border-zinc-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="text-amber-500" size={24} />
            Editar Jogador
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              className="w-full p-3 bg-black border border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-white uppercase font-bold tracking-wide"
              placeholder="NOME DO JOGADOR"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Gênero</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender(Gender.MALE)}
                className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                  gender === Gender.MALE 
                    ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400' 
                    : 'bg-black border-zinc-700 text-zinc-500 hover:border-zinc-600'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${gender === Gender.MALE ? 'bg-cyan-500' : 'bg-zinc-600'}`}></div>
                Masculino
              </button>
              
              <button
                type="button"
                onClick={() => setGender(Gender.FEMALE)}
                className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                  gender === Gender.FEMALE 
                    ? 'bg-fuchsia-900/30 border-fuchsia-500 text-fuchsia-400' 
                    : 'bg-black border-zinc-700 text-zinc-500 hover:border-zinc-600'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${gender === Gender.FEMALE ? 'bg-fuchsia-500' : 'bg-zinc-600'}`}></div>
                Feminino
              </button>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-zinc-800 text-zinc-300 rounded-xl font-bold hover:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-3 bg-amber-500 text-black rounded-xl font-bold hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};