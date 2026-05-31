import React from 'react';
import { Player } from '../types';
import { LEVELS, HERO_TYPES } from '../constants';
import { BookOpen } from 'lucide-react';

interface HeaderProps {
  player: Player;
  onOpenJournal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ player, onOpenJournal }) => {
  const currentLevel = LEVELS.slice().reverse().find(l => player.xp >= l.minXp) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.minXp > player.xp);
  
  const progress = nextLevel 
    ? ((player.xp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100 
    : 100;

  return (
    <header className="bg-eco-dark text-eco-cream p-4 shadow-md sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-3">
          <div className="text-4xl bg-eco-cream rounded-full p-2 shadow-inner">
            {HERO_TYPES[player.type].icon}
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold">{player.name}</h1>
            <p className="text-eco-light text-sm">{currentLevel.title}</p>
          </div>
        </div>

        <div className="flex-1 w-full md:max-w-md px-4">
          <div className="flex justify-between text-xs mb-1">
            <span>XP: {player.xp}</span>
            {nextLevel && <span>Next: {nextLevel.minXp}</span>}
          </div>
          <div className="w-full bg-eco-brown/50 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-eco-yellow h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-xs text-eco-light uppercase tracking-wider">EkoScore</div>
            <div className={`font-bold text-xl ${player.ecoScore < 30 ? 'text-eco-red' : 'text-eco-yellow'}`}>
              {player.ecoScore}/100
            </div>
          </div>
          
          <button 
            onClick={onOpenJournal}
            className="flex flex-col items-center text-eco-cream hover:text-eco-yellow transition-colors"
            title="Buka Jurnal Fakta"
          >
            <BookOpen size={24} />
            <span className="text-[10px] mt-1">Jurnal</span>
          </button>
        </div>

      </div>
    </header>
  );
};
