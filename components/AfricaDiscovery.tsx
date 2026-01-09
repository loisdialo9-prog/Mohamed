
import React from 'react';

interface AfricaDiscoveryProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreTopic: (topic: string) => void;
}

const AFRICA_REGIONS = [
  {
    id: 'west',
    title: 'Afrique de l\'Ouest',
    desc: 'Terre des empires Mandingue, Ashanti et Yoruba. Berceau de la musique moderne.',
    image: 'https://images.unsplash.com/photo-1532408840957-031d8034aeef?auto=format&fit=crop&q=80&w=800',
    prompt: 'Parle-moi de la diversité culturelle de l\'Afrique de l\'Ouest, des empires historiques aux mégalopoles comme Lagos.',
    color: 'from-green-500 to-emerald-700'
  },
  {
    id: 'north',
    title: 'Afrique du Nord',
    desc: 'Entre Méditerranée et Sahara. L\'héritage pharaonique, berbère et carthaginois.',
    image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80&w=800',
    prompt: 'Explique-moi l\'histoire de l\'Afrique du Nord, des pyramides d\'Égypte aux médinas du Maghreb.',
    color: 'from-amber-500 to-orange-700'
  },
  {
    id: 'east',
    title: 'Afrique de l\'Est',
    desc: 'Le berceau de l\'humanité. Des hauts plateaux d\'Éthiopie aux savanes du Kenya.',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',
    prompt: 'Parle-moi de l\'Afrique de l\'Est : la culture Swahili, les églises de Lalibela et la faune sauvage.',
    color: 'from-blue-500 to-indigo-700'
  },
  {
    id: 'central',
    title: 'Afrique Centrale',
    desc: 'Le poumon vert du continent. Forêts équatoriales, fleuve Congo et royaumes anciens.',
    image: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&q=80&w=800',
    prompt: 'Découvrons l\'Afrique Centrale : la forêt du Bassin du Congo, la musique Rumba et les traditions du Gabon et du Cameroun.',
    color: 'from-teal-500 to-cyan-700'
  },
  {
    id: 'south',
    title: 'Afrique Australe',
    desc: 'De la nation arc-en-ciel au désert du Namib. Une terre de contrastes saisissants.',
    image: 'https://images.unsplash.com/photo-1575314027842-c3365345799e?auto=format&fit=crop&q=80&w=800',
    prompt: 'Parle-moi de l\'Afrique Australe : l\'héritage de Mandela, les Chutes Victoria et le Grand Zimbabwe.',
    color: 'from-red-500 to-rose-700'
  }
];

const THEMATIC_CARDS = [
  {
    title: 'Héros de l\'Afrique',
    desc: 'Mandela, Sankara, Lumumba... les voix de la liberté.',
    icon: '✊🏾',
    prompt: 'Fais-moi un portrait inspirant des grands leaders de la libération africaine.'
  },
  {
    title: 'Nature & Biodiversité',
    desc: 'Des sommets du Kilimandjaro aux profondeurs du lac Malawi.',
    icon: '🦁',
    prompt: 'Quelles sont les merveilles naturelles les plus spectaculaires d\'Afrique ?'
  },
  {
    title: 'Futurisme Africain',
    desc: 'Innovation tech, Afrobeats et design contemporain.',
    icon: '🚀',
    prompt: 'Parle-moi de l\'essor technologique et culturel actuel en Afrique (Afro-futurisme).'
  }
];

const AfricaDiscovery: React.FC<AfricaDiscoveryProps> = ({ isOpen, onClose, onExploreTopic }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-slate-950 animate-in fade-in zoom-in duration-300 overflow-hidden">
      {/* Navbar */}
      <div className="h-20 shrink-0 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white text-xl">🌍</div>
          <div>
            <h2 className="text-xl font-bold heading-font">L'Afrique par Mohamed AI</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">54 Pays • Une seule âme</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8">
            <h1 className="text-4xl md:text-6xl font-black heading-font bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-yellow-500 to-red-600">
              Explore le Berceau du Monde
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              De la savane dorée aux métropoles futuristes, voyage à travers un continent aux mille visages. 
              Mohamed AI est ton guide pour cette aventure africaine.
            </p>
          </div>

          {/* Region Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {AFRICA_REGIONS.map((region) => (
              <div 
                key={region.id}
                className="group relative h-[400px] rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
                onClick={() => {
                  onExploreTopic(region.prompt);
                  onClose();
                }}
              >
                <img src={region.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={region.title} />
                <div className={`absolute inset-0 bg-gradient-to-t ${region.color} opacity-40 group-hover:opacity-60 transition-opacity`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                
                <div className="absolute bottom-0 left-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <h3 className="text-xl font-bold mb-2 heading-font">{region.title}</h3>
                  <p className="text-xs text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity leading-relaxed">
                    {region.desc}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/70">
                    Explorer <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7"/></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Thematic Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            {THEMATIC_CARDS.map((card, i) => (
              <button 
                key={i}
                onClick={() => {
                  onExploreTopic(card.prompt);
                  onClose();
                }}
                className="flex items-start gap-6 p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 hover:border-green-500 transition-all text-left shadow-xl hover:shadow-green-500/5 group"
              >
                <div className="shrink-0 w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-1 heading-font">{card.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{card.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Quote Section */}
          <div className="p-12 bg-gradient-to-br from-slate-900 to-slate-950 rounded-[3rem] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bogolan-pattern opacity-10"></div>
            <div className="relative z-10">
              <span className="text-5xl mb-6 block">✨</span>
              <p className="text-2xl md:text-3xl font-medium italic text-slate-300 leading-relaxed mb-8 max-w-4xl mx-auto">
                "L'Afrique a sa propre histoire, sa propre économie, sa propre culture. Elle n'est pas une simple copie d'un autre continent."
              </p>
              <button 
                onClick={() => onExploreTopic("Parle-moi de la vision de l'Union Africaine pour 2063.")}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-green-600/20"
              >
                Découvrir l'Agenda 2063
              </button>
            </div>
          </div>

        </div>
        
        <footer className="mt-20 py-10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Unité • Progrès • Culture • Mohamed AI</p>
        </footer>
      </div>
    </div>
  );
};

export default AfricaDiscovery;
