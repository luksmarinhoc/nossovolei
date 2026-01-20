import React from 'react';
import { Volleyball } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
        <Volleyball className="w-8 h-8 text-amber-400 animate-bounce-slow" />
        <div>
          <h1 className="text-2xl font-bold tracking-wider text-white">NOSSO VÔLEI</h1>
        </div>
      </div>
    </header>
  );
};