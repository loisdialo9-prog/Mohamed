
import React, { useState, useEffect } from 'react';

interface IntroAnimationProps {
  onComplete: () => void;
}

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Séquence temporelle de l'intro
    const timers = [
      setTimeout(() => setStage(1), 800),   // Salam / I ni ce
      setTimeout(() => setStage(2), 2200),  // Mohamed AI
      setTimeout(() => setStage(3), 3500),  // Final Reveal Trigger
    ];

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  useEffect(() => {
    if (stage === 3) {
      handleComplete();
    }
  }, [stage]);

  const handleComplete = () => {
    setIsExiting(true);
    setTimeout(onComplete, 800);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ease-in-out ${isExiting ? 'opacity-0 scale-110' : 'opacity-100'}`}>
      
      {/* Background cinématique */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-orange-950">
        {/* Motif Bogolan animé */}
        <div className="absolute inset-0 opacity-10 bogolan-pattern mix-blend-overlay animate-pulse"></div>
        
        {/* Particules de poussière d'or */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute bg-orange-400 rounded-full blur-[1px] animate-float"
              style={{
                width: Math.random() * 4 + 'px',
                height: Math.random() * 4 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 5 + 's',
                opacity: Math.random() * 0.5 + 0.2
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Contenu de l'animation */}
      <div className="relative z-10 text-center px-6">
        
        {/* Stage 1: Salutations */}
        <div className={`transition-all duration-1000 transform ${stage === 1 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'}`}>
          <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-4 italic">SALAM</h2>
          <div className="h-1 w-20 bg-orange-500 mx-auto rounded-full mb-4"></div>
          <p className="text-xl md:text-2xl font-bold text-orange-200 uppercase tracking-[0.5em]">I NI CE</p>
        </div>

        {/* Stage 2: Nom & Identité */}
        <div className={`transition-all duration-1000 transform ${stage >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-110 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'}`}>
          <div className="flex flex-col items-center">
            <div className="mb-6 relative">
               <span className="text-7xl">🇲🇱</span>
               <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
              MOHAMED <span className="text-orange-500">AI</span>
            </h1>
            <p className="mt-4 text-[10px] md:text-xs font-black text-orange-400 uppercase tracking-[0.4em]">Une création de Mohamed Coulibaly</p>
            <p className="mt-4 text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.6em] max-w-xs mx-auto leading-relaxed">
              L'ÂME DU MALI, LE SAVOIR DE L'AFRIQUE, LE FUTUR DU MONDE
            </p>
            
            <div className="mt-12 flex gap-4 text-xs font-bold text-white/40 uppercase tracking-widest">
              <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10">Bambara</span>
              <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10">Français</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton Skip */}
      {!isExiting && (
        <button 
          onClick={handleComplete}
          className="absolute bottom-10 right-10 text-[9px] font-black text-white/30 uppercase tracking-[0.4em] hover:text-white transition-colors py-2 px-4 border border-white/10 rounded-full bg-black/20 backdrop-blur-md"
        >
          PASSER L'INTRO
        </button>
      )}

      <style>{`
        .bogolan-pattern { background-image: url('https://www.transparenttextures.com/patterns/cubes.png'); }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-100px) translateX(20px); }
        }
        .animate-float { animation: float 10s infinite linear; }
      `}</style>
    </div>
  );
};

export default IntroAnimation;
