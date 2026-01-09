
import React from 'react';

interface MaliDiscoveryProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreTopic: (topic: string) => void;
}

const MALI_SECTIONS = [
  {
    id: 'history',
    title: 'Histoire & Empires',
    desc: 'Du puissant Empire du Mali de Mansa Moussa à l\'Empire Songhaï.',
    image: 'https://images.unsplash.com/photo-1599939304381-67856b3e7ed2?auto=format&fit=crop&q=80&w=800',
    prompt: 'Parle-moi des grands empires du Mali et de Mansa Moussa, l\'homme le plus riche de l\'histoire.',
    icon: '👑'
  },
  {
    id: 'architecture',
    title: 'Architecture en Terre',
    desc: 'La majestueuse Mosquée de Djenné et les manuscrits de Tombouctou.',
    image: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=800',
    prompt: 'Explique-moi l\'architecture soudano-sahélienne en terre crue, notamment la Grande Mosquée de Djenné.',
    icon: '🕌'
  },
  {
    id: 'art',
    title: 'Art du Bogolan',
    desc: 'L\'art sacré de la teinture à la terre et les motifs traditionnels.',
    image: 'https://images.unsplash.com/photo-1621503716719-f70346387a22?auto=format&fit=crop&q=80&w=800',
    prompt: 'Quelle est la signification des motifs du Bogolan malien et comment est-il fabriqué ?',
    icon: '🎨'
  },
  {
    id: 'music',
    title: 'Musique & Griots',
    desc: 'Le son cristallin de la Kora et les récits des gardiens de la mémoire.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
    prompt: 'Parle-moi de la musique malienne, de la Kora et du rôle social des Griots.',
    icon: '🎵'
  },
  {
    id: 'gastronomy',
    title: 'Gastronomie',
    desc: 'Tigadèguèna, Mafé, et le célèbre riz au gras malien.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
    prompt: 'Quels sont les plats traditionnels maliens incontournables comme le Tigadèguèna ou le Mafé ?',
    icon: '🍲'
  },
  {
    id: 'dogon',
    title: 'Pays Dogon',
    desc: 'Les falaises de Bandiagara et la cosmogonie fascinante des Dogons.',
    image: 'https://images.unsplash.com/photo-1509015392842-8c76743b0704?auto=format&fit=crop&q=80&w=800',
    prompt: 'Parle-moi du Peuple Dogon, de leurs traditions astronomiques et des falaises de Bandiagara.',
    icon: '👺'
  }
];

const MaliDiscovery: React.FC<MaliDiscoveryProps> = ({ isOpen, onClose, onExploreTopic }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950 animate-in slide-in-from-bottom duration-500 overflow-hidden">
      {/* Header Immersif */}
      <div className="relative h-64 md:h-80 shrink-0">
        <img 
          src="https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&q=80&w=1200" 
          className="w-full h-full object-cover"
          alt="Mali Landscape"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-transparent to-black/30"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-6 left-6 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="absolute bottom-8 left-8 right-8">
          <h1 className="text-4xl md:text-6xl font-black heading-font text-slate-900 dark:text-white mb-2">
            Mali <span className="text-green-600">Dembaya</span>
          </h1>
          <p className="text-lg text-slate-700 dark:text-slate-300 font-medium max-w-2xl italic">
            "Le Mali est un pays de rencontre, de paix et de culture millénaire. Bienvenue chez vous."
          </p>
        </div>
      </div>

      {/* Contenu Scrollable */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MALI_SECTIONS.map((section) => (
              <div 
                key={section.id}
                className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/10"
              >
                <div className="h-48 relative overflow-hidden">
                  <img 
                    src={section.image} 
                    alt={section.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-2 rounded-xl text-2xl shadow-lg">
                    {section.icon}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 heading-font text-slate-900 dark:text-white">{section.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed">
                    {section.desc}
                  </p>
                  
                  <button 
                    onClick={() => {
                      onExploreTopic(section.prompt);
                      onClose();
                    }}
                    className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-green-600 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    Demander à Mohamed
                    <svg className="w-4 h-4 transform transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 p-8 bg-green-600 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-green-600/30">
            <div className="shrink-0 w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl">
              🌍
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-2xl font-bold mb-2">Un pays d'hospitalité (Diatiguiya)</h4>
              <p className="text-green-50 opacity-90 leading-relaxed">
                Le Mali n'est pas seulement un territoire, c'est une âme. De Bamako à Gao, chaque ville raconte une histoire de bravoure, de commerce et de sagesse. Continuez à explorer pour comprendre pourquoi nous sommes fiers de nos racines.
              </p>
            </div>
            <button 
              onClick={() => onExploreTopic("Fais-moi découvrir une anecdote surprenante sur le Mali.")}
              className="px-6 py-4 bg-white text-green-700 font-bold rounded-2xl hover:bg-green-50 transition-colors whitespace-nowrap shadow-xl"
            >
              Anecdote Aléatoire
            </button>
          </div>
        </div>
        
        <footer className="mt-20 py-8 text-center opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Patrimoine du Mali • Mohamed AI 2025</p>
        </footer>
      </div>
    </div>
  );
};

export default MaliDiscovery;
