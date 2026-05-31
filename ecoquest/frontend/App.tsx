import React, { useState } from 'react';
import { GameState, Player, HeroType, City, MissionData, OutcomeData } from './types';
import { INITIAL_CITIES, HERO_TYPES, BADGES } from './constants';
import { generateMission, generateOutcome } from './services/geminiService';
import { Header } from './components/Header';
import { JournalModal } from './components/JournalModal';
import { Map as MapIcon, AlertTriangle, CheckCircle, ShieldAlert, Loader2 } from 'lucide-react';

const INITIAL_PLAYER: Player = {
  name: '',
  type: 'FOREST',
  xp: 0,
  level: 1,
  ecoScore: 30, // EkoScore awal diubah menjadi 30
  badges: [],
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('INTRO');
  const [player, setPlayer] = useState<Player>(INITIAL_PLAYER);
  const [cities, setCities] = useState<City[]>(INITIAL_CITIES);
  const [activeCity, setActiveCity] = useState<City | null>(null);
  
  const [missionData, setMissionData] = useState<MissionData | null>(null);
  const [outcomeData, setOutcomeData] = useState<OutcomeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [journal, setJournal] = useState<string[]>([]);
  const [isJournalOpen, setIsJournalOpen] = useState(false);

  const [introName, setIntroName] = useState('');
  const [introType, setIntroType] = useState<HeroType>('FOREST');
  
  const [missionsPlayed, setMissionsPlayed] = useState(0);

  // --- Handlers ---

  const handleStartGame = (name: string, type: HeroType) => {
    const finalName = name.trim() === '' ? 'Pahlawan' : name.trim();
    setPlayer({ ...INITIAL_PLAYER, name: finalName, type });
    setCities(INITIAL_CITIES);
    setJournal([]);
    setMissionsPlayed(0);
    setGameState('MAP');
  };

  const handleSelectCity = async (city: City) => {
    setActiveCity(city);
    setGameState('MISSION');
    setIsLoading(true);
    
    const data = await generateMission(player.name, player.type, city.name);
    setMissionData(data);
    setIsLoading(false);
  };

  const handleSelectChoice = async (choiceText: string) => {
    if (!activeCity || !missionData) return;
    
    setGameState('OUTCOME');
    setIsLoading(true);
    
    const data = await generateOutcome(
      player.name, 
      player.type, 
      activeCity.name, 
      missionData.story, 
      choiceText
    );
    
    setOutcomeData(data);
    setIsLoading(false);

    const newMissionsPlayed = missionsPlayed + 1;
    setMissionsPlayed(newMissionsPlayed);

    // Update Player Stats
    setPlayer(prev => {
      const newEcoScore = Math.max(0, Math.min(100, prev.ecoScore + data.ecoScoreChange));
      const newXp = prev.xp + data.xpChange;
      
      // Badge diberikan setiap 2 misi yang diselesaikan
      let newBadges = [...prev.badges];
      if (newMissionsPlayed % 2 === 0 && newBadges.length < BADGES.length) {
         newBadges.push(BADGES[newBadges.length]);
      }

      return { ...prev, ecoScore: newEcoScore, xp: newXp, badges: newBadges };
    });

    // Update Journal
    if (data.fact) {
      setJournal(prev => [data.fact, ...prev]);
    }

    // Update City Status
    setCities(prev => prev.map(c => 
      c.id === activeCity.id 
        ? { ...c, completed: true, status: data.ecoScoreChange > 0 ? 'SAFE' : 'WARNING' } 
        : c
    ));
  };

  const handleContinueFromOutcome = () => {
    // Check win/loss conditions based on EcoScore
    if (player.ecoScore <= 0) {
      setGameState('GAMEOVER');
    } else if (player.ecoScore >= 100) {
      setGameState('VICTORY');
    } else {
      setGameState('MAP');
    }
    
    setMissionData(null);
    setOutcomeData(null);
    setActiveCity(null);
  };

  const handleRestart = () => {
    setGameState('INTRO');
    setPlayer(INITIAL_PLAYER);
    setIntroName('');
    setIntroType('FOREST');
    setMissionsPlayed(0);
  };

  // --- Render Helpers ---

  const renderIntro = () => {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://picsum.photos/id/325/1920/1080')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-eco-dark/80 backdrop-blur-sm"></div>
        <div className="bg-eco-cream p-8 rounded-2xl shadow-2xl max-w-2xl w-full relative z-10 border-4 border-eco-brown fade-in">
          <div className="text-center mb-8">
            <h1 className="font-serif text-5xl font-extrabold text-eco-dark mb-2 tracking-tight">EcoQuest</h1>
            <p className="text-eco-brown font-semibold text-lg">Misi Selamatkan Bumi Indonesia</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-eco-dark font-bold mb-2">Nama Pahlawan:</label>
              <input 
                type="text" 
                value={introName}
                onChange={(e) => setIntroName(e.target.value)}
                placeholder="Masukkan namamu... (Kosongkan untuk 'Pahlawan')"
                className="w-full p-3 rounded-lg border-2 border-eco-light focus:outline-none focus:border-eco-dark bg-white text-eco-dark font-bold transition-colors"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-eco-dark font-bold mb-3">Pilih Kekuatanmu:</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.keys(HERO_TYPES) as HeroType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setIntroType(t)}
                    className={`p-4 rounded-xl border-4 text-left transition-all duration-300 ${
                      introType === t 
                        ? 'border-eco-dark bg-eco-light/20 shadow-md transform scale-105' 
                        : 'border-transparent bg-white hover:bg-eco-light/10'
                    }`}
                  >
                    <div className="text-4xl mb-2">{HERO_TYPES[t].icon}</div>
                    <div className="font-bold text-eco-dark">{HERO_TYPES[t].name}</div>
                    <div className="text-xs text-eco-brown mt-1 leading-tight">{HERO_TYPES[t].desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => handleStartGame(introName, introType)}
              className="w-full bg-eco-dark text-eco-yellow font-bold text-xl py-4 rounded-xl hover:bg-eco-light hover:text-eco-dark transition-all duration-300 mt-4 shadow-lg transform hover:-translate-y-1"
            >
              Mulai Petualangan
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMap = () => (
    <div className="max-w-5xl mx-auto p-6 fade-in">
      <div className="text-center mb-10">
        <h2 className="font-serif text-4xl font-bold text-eco-dark mb-3 flex items-center justify-center gap-3">
          <MapIcon size={36} /> Peta Misi Nusantara
        </h2>
        <p className="text-eco-brown text-lg">Pilih kota yang membutuhkan bantuanmu segera!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map(city => (
          <div 
            key={city.id}
            className={`relative rounded-2xl border-4 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer ${
              city.completed 
                ? 'bg-eco-light/20 border-eco-light' 
                : 'bg-white border-eco-brown'
            }`}
            onClick={() => handleSelectCity(city)}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-serif text-2xl font-bold text-eco-dark">{city.name}</h3>
              {city.completed ? (
                <CheckCircle className="text-eco-light" size={28} />
              ) : city.status === 'DANGER' ? (
                <ShieldAlert className="text-eco-red animate-pulse" size={28} />
              ) : (
                <AlertTriangle className="text-eco-yellow" size={28} />
              )}
            </div>
            
            <p className="text-eco-dark/80 text-sm mb-6 min-h-[3rem]">
              {city.description}
            </p>

            <button className="w-full bg-eco-brown text-eco-cream py-2 rounded-lg font-bold hover:bg-eco-dark transition-colors">
              {city.completed ? 'Misi Baru' : `Berangkat ke ${city.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMission = () => (
    <div className="max-w-3xl mx-auto p-6 fade-in">
      <div className="bg-white rounded-2xl shadow-xl border-4 border-eco-brown overflow-hidden">
        <div className="bg-eco-brown text-eco-cream p-6 text-center">
          <h2 className="font-serif text-3xl font-bold">Misi: {activeCity?.name}</h2>
        </div>
        
        <div className="p-8">
          {isLoading || !missionData ? (
            <div className="flex flex-col items-center justify-center py-20 text-eco-dark">
              <Loader2 className="animate-spin mb-4" size={48} />
              <p className="text-lg font-bold animate-pulse">Menganalisis situasi lingkungan...</p>
            </div>
          ) : (
            <div className="fade-in">
              <div className="prose prose-lg text-eco-dark mb-8 leading-relaxed">
                {missionData.story.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>
              
              <h3 className="font-bold text-xl text-eco-dark mb-4 border-b-2 border-eco-light pb-2">Pilih Tindakanmu:</h3>
              <div className="space-y-4">
                {missionData.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectChoice(choice.text)}
                    className="w-full text-left p-4 rounded-xl border-2 border-eco-brown/30 bg-eco-cream hover:bg-eco-light/20 hover:border-eco-dark transition-all flex gap-4 items-center group"
                  >
                    <span className="bg-eco-brown text-eco-cream w-8 h-8 rounded-full flex items-center justify-center font-bold group-hover:bg-eco-dark shrink-0 transition-colors">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-eco-dark font-semibold">{choice.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderOutcome = () => (
    <div className="max-w-3xl mx-auto p-6 fade-in">
      <div className="bg-white rounded-2xl shadow-xl border-4 border-eco-dark overflow-hidden">
        <div className="bg-eco-dark text-eco-cream p-6 text-center">
          <h2 className="font-serif text-3xl font-bold">Laporan Misi</h2>
        </div>
        
        <div className="p-8">
          {isLoading || !outcomeData ? (
            <div className="flex flex-col items-center justify-center py-20 text-eco-dark">
              <Loader2 className="animate-spin mb-4" size={48} />
              <p className="text-lg font-bold animate-pulse">Mengevaluasi dampak tindakanmu...</p>
            </div>
          ) : (
            <div className="fade-in space-y-6">
              <div className="text-center mb-2">
                <h3 className="text-3xl font-black text-eco-dark">{outcomeData.label}</h3>
              </div>
              
              <div className="text-lg text-eco-dark leading-relaxed bg-eco-cream p-6 rounded-xl border border-eco-brown/20">
                <p className="mb-4">{outcomeData.outcomeStory}</p>
                <div className="bg-white/60 p-4 rounded-lg border border-eco-brown/10">
                  <strong className="text-eco-brown">Analisis:</strong> {outcomeData.explanation}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-eco-light/20 p-4 rounded-xl text-center border border-eco-light">
                  <div className="text-sm text-eco-dark font-bold uppercase mb-1">XP Diperoleh</div>
                  <div className="text-3xl font-black text-eco-dark">+{outcomeData.xpChange}</div>
                </div>
                <div className={`p-4 rounded-xl text-center border ${outcomeData.ecoScoreChange >= 0 ? 'bg-eco-light/20 border-eco-light' : 'bg-eco-red/10 border-eco-red'}`}>
                  <div className="text-sm text-eco-dark font-bold uppercase mb-1">Perubahan EkoScore</div>
                  <div className={`text-3xl font-black ${outcomeData.ecoScoreChange >= 0 ? 'text-eco-dark' : 'text-eco-red'}`}>
                    {outcomeData.ecoScoreChange > 0 ? '+' : ''}{outcomeData.ecoScoreChange}
                  </div>
                </div>
              </div>

              <div className="bg-eco-yellow/20 p-6 rounded-xl border-l-4 border-eco-yellow flex gap-4 items-start">
                <span className="text-3xl">💡</span>
                <p className="text-eco-dark font-semibold italic">{outcomeData.fact}</p>
              </div>

              <button 
                onClick={handleContinueFromOutcome}
                className="w-full bg-eco-brown text-eco-cream font-bold text-xl py-4 rounded-xl hover:bg-eco-dark transition-all duration-300 shadow-md transform hover:-translate-y-1"
              >
                Lanjutkan Perjalanan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderGameOver = () => (
    <div className="min-h-screen flex items-center justify-center p-4 bg-eco-dark relative">
      <div className="bg-eco-cream p-10 rounded-3xl shadow-2xl max-w-2xl w-full text-center border-8 border-eco-red fade-in">
        <div className="text-6xl mb-4">💀</div>
        <h1 className="font-serif text-5xl font-bold text-eco-red mb-4">Bumi Menangis...</h1>
        <p className="text-xl text-eco-dark mb-8">
          EkoScore-mu turun ke 0. Kerusakan lingkungan di kota-kota tidak tertangani dengan baik.
        </p>
        
        <div className="bg-white p-6 rounded-xl text-left mb-8 border-2 border-eco-brown/20">
          <h3 className="font-bold text-eco-dark mb-2">Pesan dari Alam:</h3>
          <p className="text-eco-brown italic">
            "Setiap keputusan yang kita buat berdampak pada alam. Jangan menyerah, pelajari kesalahanmu, dan jadilah pahlawan yang lebih bijak di kehidupan nyata."
          </p>
        </div>

        <button 
          onClick={handleRestart}
          className="bg-eco-dark text-eco-yellow font-bold text-xl py-4 px-10 rounded-xl hover:bg-eco-light hover:text-eco-dark transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );

  const renderVictory = () => (
    <div className="min-h-screen flex items-center justify-center p-4 bg-eco-light relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iI0ZGRDE2NiIvPjwvc3ZnPg==')]"></div>
      
      <div className="bg-eco-cream p-10 rounded-3xl shadow-2xl max-w-3xl w-full text-center border-8 border-eco-yellow fade-in relative z-10">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="font-serif text-5xl font-bold text-eco-dark mb-2">Kamu berhasil selamatkan Nusantara!</h1>
        <h2 className="text-2xl text-eco-brown font-bold mb-8">Terima Kasih, {player.name} sang {HERO_TYPES[player.type].name}</h2>
        
        <div className="bg-white p-6 rounded-xl text-left mb-8 border-2 border-eco-brown/20 flex justify-around">
          <div className="text-center">
            <div className="text-sm text-eco-brown font-bold uppercase">Total Misi Selesai</div>
            <div className="text-4xl font-black text-eco-dark">{missionsPlayed}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-eco-brown font-bold uppercase">Total XP</div>
            <div className="text-4xl font-black text-eco-dark">{player.xp}</div>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 mb-10 flex-wrap">
          {player.badges.map((badge, i) => (
            <div key={i} className="bg-white w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-md border-2 border-eco-yellow animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
              {badge}
            </div>
          ))}
        </div>

        <button 
          onClick={handleRestart}
          className="bg-eco-dark text-eco-yellow font-bold text-xl py-4 px-10 rounded-xl hover:bg-eco-light hover:text-eco-dark transition-colors shadow-lg"
        >
          Main Lagi
        </button>
      </div>
    </div>
  );

  // --- Main Render ---

  if (gameState === 'INTRO') return renderIntro();
  if (gameState === 'GAMEOVER') return renderGameOver();
  if (gameState === 'VICTORY') return renderVictory();

  return (
    <div className="min-h-screen flex flex-col">
      <Header player={player} onOpenJournal={() => setIsJournalOpen(true)} />
      
      <main className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
        {gameState === 'MAP' && renderMap()}
        {gameState === 'MISSION' && renderMission()}
        {gameState === 'OUTCOME' && renderOutcome()}
      </main>

      <JournalModal 
        isOpen={isJournalOpen} 
        onClose={() => setIsJournalOpen(false)} 
        facts={journal} 
      />
    </div>
  );
}
