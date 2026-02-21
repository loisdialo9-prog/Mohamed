
import React from 'react';

interface MaliDiscoveryProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreTopic: (topic: string) => void;
}

const INFO_CARDS = [
  { title: "L'Empire du Mali", val: "1235-1670", icon: "🏛️", desc: "Le plus puissant d'Afrique de l'Ouest." },
  { title: "Manuscrits", val: "300,000+", icon: "📜", desc: "Tombouctou, centre du savoir mondial." },
  { title: "Population", val: "22 Millions", icon: "👥", desc: "Une mosaïque d'ethnies unies." },
  { title: "Or du Mali", val: "3ème Prod.", icon: "💎", desc: "Richesse minière ancestrale." },
];

const MaliDiscovery: React.FC<MaliDiscoveryProps> = ({ isOpen, onClose, onExploreTopic }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      
      <div className="relative w-full md:w-[450px] h-full bg-white dark:bg-slate-950 shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col border-l-8 border-orange-500">
        
        <div className="relative h-64 shrink-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=1000" 
            className="w-full h-full object-cover" 
            alt="Mali" 
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-transparent to-transparent"></div>
          <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-xl rounded-2xl text-white border border-white/20 hover:bg-white/40 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="absolute bottom-8 left-8">
            <span className="text-[10px] font-black bg-orange-500 text-white px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">Mali Ba</span>
            <h2 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter">LE MALI <br/><span className="text-orange-600 italic">ÉTERNEL</span></h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          <div className="grid grid-cols-2 gap-4">
            {INFO_CARDS.map((card, i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:border-orange-500 transition-all">
                <span className="text-2xl mb-2 block">{card.icon}</span>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{card.title}</p>
                <p className="text-lg font-black text-slate-950 dark:text-white my-1">{card.val}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-600 px-1">Patrimoine UNESCO</h3>
            {[
              { 
                t: "La Falaise de Bandiagara", 
                d: "Pays Dogon, mystère et cosmogonie.", 
                p: "Parle-moi en détail de la Falaise de Bandiagara au Pays Dogon. Explique pourquoi c'est un site unique au monde classé par l'UNESCO, en abordant à la fois le paysage grandiose et la richesse culturelle de la cosmogonie Dogon." 
              },
              { 
                t: "Villes de Terre (Djenné)", 
                d: "Djenné et son architecture unique.", 
                p: "Explique-moi l'histoire et la splendeur des Villes anciennes de Djenné. Focalise-toi sur son architecture exceptionnelle en terre crue, la Grande Mosquée, et l'importance de ce patrimoine mondial pour l'identité malienne." 
              },
              { 
                t: "Tombouctou", 
                d: "La perle du désert, cité des 333 saints.", 
                p: "Raconte-moi l'histoire de la cité mystérieuse de Tombouctou. Parle de ses mosquées mythiques (Djingareyber, Sankoré, Sidi Yahia) et de ses précieux manuscrits anciens qui témoignent de l'âge d'or intellectuel du Mali." 
              }
            ].map((item, i) => (
              <button 
                key={i} 
                onClick={() => { onExploreTopic(item.p); onClose(); }}
                className="w-full p-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-left hover:border-orange-500 shadow-sm hover:shadow-xl transition-all group"
              >
                <h4 className="font-black text-slate-950 dark:text-white group-hover:text-orange-600 transition-colors">{item.t}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.d}</p>
              </button>
            ))}
          </div>

          <div className="p-6 bg-slate-950 rounded-3xl text-white relative overflow-hidden group cursor-pointer" onClick={() => onExploreTopic("Donne-moi un proverbe malien célèbre et explique-le.")}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform"><span className="text-6xl">🖋️</span></div>
            <h4 className="font-black text-lg mb-2">Sagesse Malienne</h4>
            <p className="text-xs text-slate-400 leading-relaxed italic">"C'est au bout de l'ancienne corde qu'on tisse la nouvelle."</p>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500">
               <span>Explorer les proverbes</span>
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MaliDiscovery;
