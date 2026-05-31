import React from 'react';
import { X } from 'lucide-react';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  facts: string[];
}

export const JournalModal: React.FC<JournalModalProps> = ({ isOpen, onClose, facts }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
      <div className="bg-eco-cream w-full max-w-2xl rounded-xl shadow-2xl border-4 border-eco-brown overflow-hidden flex flex-col max-h-[80vh]">
        
        <div className="bg-eco-brown text-eco-cream p-4 flex justify-between items-center">
          <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
            📖 Jurnal Penemuan
          </h2>
          <button onClick={onClose} className="hover:text-eco-yellow transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {facts.length === 0 ? (
            <div className="text-center text-eco-dark/60 py-10 italic">
              Belum ada fakta yang ditemukan. Selesaikan misi untuk mengumpulkan fakta lingkungan!
            </div>
          ) : (
            <ul className="space-y-4">
              {facts.map((fact, index) => (
                <li key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-eco-light flex gap-3 items-start">
                  <span className="text-2xl">💡</span>
                  <p className="text-eco-dark leading-relaxed">{fact}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
