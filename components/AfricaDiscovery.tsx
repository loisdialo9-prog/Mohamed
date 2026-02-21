
import React from 'react';

interface AfricaDiscoveryProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreTopic: (topic: string) => void;
}

const AfricaDiscovery: React.FC<AfricaDiscoveryProps> = ({ isOpen, onClose, onExploreTopic }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      
      <div className="relative w-full md:w-[450px] h-full bg-white dark:bg-slate-950 shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col border-l-8 border-green-700">
        
        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
             <span className="text-4xl">🌍</span>
             <button onClick={onClose} className="p-2 text-slate-400 hover:text-green-700 transition-colors">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
          <h2 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter leading-none uppercase">AFRIQUE <br/><span className="text-green-700">MODERNE</span></h2>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3 italic">L'union fait la force - Fadenya ani Sinjiya</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          <div className="grid grid-cols-2 gap-3">
             {[
               { t: "Population", v: "1.4 Mrd", c: "bg-blue-500" },
               { t: "Superficie", v: "30.3 M km²", c: "bg-orange-500" },
               { t: "Croissance", v: "+4.5%", c: "bg-purple-500" },
               { t: "Moyenne d'âge", v: "19 ans", c: "bg-emerald-500" }
             ].map((st, i) => (
               <div key={i} className="p-5 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                  <div className={`w-8 h-1 rounded-full ${st.c} mb-3`}></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{st.t}</p>
                  <p className="text-xl font-black text-slate-950 dark:text-white mt-1">{st.v}</p>
               </div>
             ))}
          </div>

          <div className="space-y-4">
             <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-green-700 px-1">Enjeux & Futur</h3>
             {[
               { icon: "🚀", t: "La Tech Africaine", d: "Du mobile money à l'IA.", p: "Parle-moi de l'écosystème tech en Afrique." },
               { icon: "🍃", t: "Grande Muraille Verte", d: "Le défi écologique.", p: "C'est quoi la Grande Muraille Verte ?" },
             ].map((topic, i) => (
               <button 
                 key={i} 
                 onClick={() => { onExploreTopic(topic.p); onClose(); }}
                 className="w-full flex items-center gap-5 p-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] hover:border-green-700 hover:shadow-xl transition-all group"
               >
                 <span className="text-3xl group-hover:scale-125 transition-transform">{topic.icon}</span>
                 <div className="text-left">
                    <h4 className="font-black text-slate-950 dark:text-white">{topic.t}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{topic.d}</p>
                 </div>
               </button>
             ))}
          </div>

          <div className="p-8 bg-green-700 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group cursor-pointer" onClick={() => onExploreTopic("Parle-moi de l'Union Africaine et ses objectifs.")}>
             <div className="absolute top-0 right-0 p-4 opacity-20"><span className="text-7xl">🤝</span></div>
             <h4 className="text-2xl font-black leading-none mb-2 tracking-tighter uppercase">Agenda <br/>2063</h4>
             <p className="text-xs opacity-90 leading-relaxed font-medium">Le plan de l'Union Africaine pour transformer le continent en puissance mondiale.</p>
             <button className="mt-6 px-6 py-2 bg-white text-green-800 text-[10px] font-black uppercase rounded-full group-hover:bg-slate-900 group-hover:text-white transition-all">Découvrir la vision</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AfricaDiscovery;
