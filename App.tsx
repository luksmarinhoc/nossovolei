import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PlayerInput } from './components/PlayerInput';
import { TeamControls } from './components/TeamControls';
import { TeamDisplay } from './components/TeamDisplay';
import { EditPlayerModal } from './components/EditPlayerModal';
import { Player, Gender } from './types';
import { balanceTeams, getNextTeamForNewPlayer, processGameResult, removePlayerAndRefill } from './utils/balancer';

const STORAGE_KEY = 'nosso_volei_data_v2';
const LEGACY_STORAGE_KEY = 'volleyMix_players';

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Load from local storage
  useEffect(() => {
    // Try new key first
    let savedPlayers = localStorage.getItem(STORAGE_KEY);
    
    // Fallback to legacy key if new key is empty
    if (!savedPlayers) {
      savedPlayers = localStorage.getItem(LEGACY_STORAGE_KEY);
    }

    if (savedPlayers) {
      try {
        const parsed = JSON.parse(savedPlayers);
        // Ensure data integrity
        if (Array.isArray(parsed)) {
           const migratedPlayers = parsed.map((p: any, index: number) => ({
            ...p,
            sequenceNumber: typeof p.sequenceNumber === 'number' ? p.sequenceNumber : index + 1
          }));
          setPlayers(migratedPlayers);
        }
      } catch (e) {
        console.error("Failed to load players", e);
        // If corrupt, clear it
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    try {
      if (players.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
      } else {
        // If empty, remove the key to keep it clean
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [players]);

  const handleAddPlayer = (name: string, gender: Gender) => {
    setPlayers((prev) => {
      const maxSequence = prev.reduce((max, p) => Math.max(max, p.sequenceNumber || 0), 0);
      const nextSequence = maxSequence + 1;
      const nextTeam = getNextTeamForNewPlayer(prev);

      const newPlayer: Player = {
        id: crypto.randomUUID(),
        name: name.toUpperCase(),
        gender,
        team: nextTeam,
        sequenceNumber: nextSequence,
        createdAt: Date.now(),
      };

      return [...prev, newPlayer];
    });
  };

  const handleUpdatePlayer = (id: string, name: string, gender: Gender) => {
    setPlayers((prev) => 
      prev.map(p => p.id === id ? { ...p, name: name.toUpperCase(), gender } : p)
    );
    setEditingPlayer(null);
  };

  const handleAddRandomPlayer = () => {
    const maleNames = ["Bruno", "Carlos", "Daniel", "Eduardo", "Felipe", "Gabriel", "Henrique", "Igor", "João", "Lucas", "Mateus", "Pedro", "Rafael", "Thiago", "Vitor", "Arthur", "Bernardo", "Caio", "Davi", "Enzo"];
    const femaleNames = ["Amanda", "Beatriz", "Camila", "Daniela", "Fernanda", "Gabriela", "Helena", "Isabela", "Julia", "Larissa", "Mariana", "Natália", "Patrícia", "Rafaela", "Sofia", "Alice", "Bianca", "Clara", "Diana", "Elisa"];

    const randomGender = Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE;
    const nameList = randomGender === Gender.MALE ? maleNames : femaleNames;
    const randomName = nameList[Math.floor(Math.random() * nameList.length)];
    
    handleAddPlayer(randomName.toUpperCase(), randomGender);
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers((prev) => removePlayerAndRefill(prev, id));
  };

  const handleShuffleTeams = () => {
    const mixedPlayers = balanceTeams(players);
    setPlayers(mixedPlayers);
  };

  const handleReset = () => {
    if (window.confirm("ATENÇÃO: Isso apagará TODOS os jogadores e times.\n\nDeseja realmente resetar o aplicativo?")) {
      setPlayers([]);
    }
  };

  const handleWin = (team: 'A' | 'B') => {
    if (window.confirm(`Confirmar vitória do Time ${team}? \n(Os perdedores irão para o final da fila)`)) {
      setPlayers(prev => processGameResult(prev, team));
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-black text-white font-sans">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 pt-8">
        
        <div className="max-w-xl mx-auto mb-8">
          <PlayerInput onAddPlayer={handleAddPlayer} />
        </div>

        <TeamControls 
          playerCount={players.length}
          onGenerate={handleShuffleTeams}
          onAddRandom={handleAddRandomPlayer}
          onReset={handleReset}
        />

        <TeamDisplay 
          players={players} 
          onRemovePlayer={handleRemovePlayer} 
          onEditPlayer={setEditingPlayer}
          onTeamWin={handleWin}
        />

      </main>

      <EditPlayerModal 
        isOpen={!!editingPlayer}
        player={editingPlayer}
        onClose={() => setEditingPlayer(null)}
        onSave={handleUpdatePlayer}
      />
    </div>
  );
};

export default App;