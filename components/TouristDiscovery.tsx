
import React, { useState } from 'react';

interface TouristDiscoveryProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreTopic: (topic: string) => void;
}

const INTERESTS = [
  { id: 'history', label: 'Histoire & Culture', icon: '🏛️' },
  { id: 'nature', label: 'Nature & Safari', icon: '🌿' },
  { id: 'food', label: 'Gastronomie', icon: '🥘' },
  { id: 'adventure', label: 'Aventure', icon: '🧗' },
  { id: 'night', label: 'Vie Nocturne', icon: '🌃' },
];

const DESTINATIONS = [
  {
    id: 'mali-complet',
    title: 'Mali : Terre des Empires',
    location: 'Afrique de l\'Ouest',
    tags: ['Patrimoine', 'Mystique'],
    image: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=1000',
    desc: 'De la boucle du Niger aux falaises du Pays Dogon.',
  },
  {
    id: 'senegal-teranga',
    title: 'Sénégal : La Teranga',
    location: 'Afrique de l\'Ouest',
    tags: ['Plages', 'Musique'],
    image: 'https://images.unsplash.com/photo-1599739291060-4578e77dac5d?auto=format&fit=crop&q=80&w=1000',
    desc: 'L\'hospitalité légendaire entre Saint-Louis et la Casamance.',
  },
  {
    id: 'kenya-savane',
    title: 'Kenya : Cœur Sauvage',
    location: 'Afrique de l\'Est',
    tags: ['Safari', 'Aventure'],
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1000',
    desc: 'Le spectacle grandiose de la nature dans le Masai Mara.',
  }
];

const TOOLKIT_ITEMS = [
  { 
    icon: '🛡️', 
    label: 'Santé', 
    prompt: "Mohamed, sois mon conseiller santé. Donne-moi les précautions indispensables (vaccins, eau, paludisme) pour un voyage sécurisé en Afrique, avec tes astuces de local pour rester en forme."
  },
  { 
    icon: '💰', 
    label: 'Argent', 
    prompt: "Mohamed, aide-moi pour le budget. Explique-moi le change, les pourboires, et comment utiliser le Mobile Money comme un vrai local pour ne pas me faire avoir."
  },
  { 
    icon: '🤝', 
    label: 'Respect', 
    prompt: "Mohamed, guide-moi sur les coutumes. Quelles sont les erreurs à éviter pour respecter la dignité des gens, bien saluer les anciens et s'intégrer avec élégance ?"
  }
];

const TouristDiscovery: React.FC<TouristDiscoveryProps> = ({ isOpen, onClose, onExploreTopic }) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [targetCountry, setTargetCountry] = useState('');
  const [duration, setDuration] = useState('7');

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handlePlanTrip = () => {
    if (!targetCountry) return;
    const interestsText = selectedInterests.length > 0 
      ? `Mes centres d'intérêt sont : ${selectedInterests.map(id => INTERESTS.find(i => i.id === id)?.label).join(', ')}.`
      : "Propose-moi un mélange équilibré d'activités.";
      
    const prompt = `Mohamed, mon Diatigui, j'ai besoin de tes lumières ! Je souhaite visiter le pays suivant : ${targetCountry} pendant ${duration} jours. 
    ${interestsText} 
    Agis comme mon guide personnel. Prépare-moi un itinéraire détaillé JOUR PAR JOUR (Matin, Après-midi, Soir). 
    Ajoute tes "astuces de local" que les touristes ne connaissent pas, et conseille-moi sur les meilleurs plats à goûter absolument. Parle-moi avec ton cœur de guide !`;
    
    onExploreTopic(prompt);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />
      
      <div className="relative w-full md:w-[550px] h-full bg-white dark:bg-slate-950 shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col border-l-8 border-indigo-600">
        
        {/* Header Premium */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-900 bg-indigo-600 text-white shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
              <span className="text-3xl">🧳</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-all">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">VOTRE GUIDE <br/><span className="opacity-80">MOHAMED</span></h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-3 text-indigo-200">Expertise locale & Itinéraires sur-mesure</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
          
          {/* Section 1: Planificateur */}
          <section className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 space-y-6 shadow-inner">
            <h3 className="text-[11px] font-black uppercase text-indigo-600 tracking-[0.2em] px-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
              Planifier mon voyage
            </h3>
            
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Quel pays d'Afrique ? (Ex: Mali, Ghana...)"
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                className="w-full px-6 py-4 bg-white dark:bg-slate-800 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-bold transition-all shadow-sm"
              />
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-1">Durée (jours)</p>
                  <input 
                    type="number" 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-6 py-4 bg-white dark:bg-slate-800 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-600"
                  />
                </div>
                <div className="flex-[2]">
                  <p className="text-[9px] font-black text-slate-400 uppercase ml-2 mb-1">Mes Passions</p>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(interest => (
                      <button 
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selectedInterests.includes(interest.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500'}`}
                      >
                        {interest.icon} {interest.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handlePlanTrip}
                disabled={!targetCountry}
                className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-slate-950 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <span>CONSTRUIRE MON ITINÉRAIRE</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </button>
            </div>
          </section>

          {/* Toolkit Rapide */}
          <div className="grid grid-cols-3 gap-3">
            {TOOLKIT_ITEMS.map((item, i) => (
              <button 
                key={i}
                onClick={() => { onExploreTopic(item.prompt); onClose(); }}
                className="p-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl hover:border-indigo-600 transition-all group"
              >
                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{item.icon}</span>
                <p className="text-[10px] font-black text-slate-950 dark:text-white uppercase leading-none">{item.label}</p>
              </button>
            ))}
          </div>

          {/* Destinations Favorites */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] px-2">Destinations recommandées</h3>
            {DESTINATIONS.map(dest => (
              <div key={dest.id} className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-600 transition-all shadow-sm hover:shadow-2xl">
                <div className="h-48 overflow-hidden">
                   <img src={dest.image} alt={dest.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-xl font-black text-slate-950 dark:text-white">{dest.title}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{dest.location}</p>
                    </div>
                    <div className="flex gap-1">
                       {dest.tags.map(tag => <span key={tag} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 text-[8px] font-black rounded-full uppercase">{tag}</span>)}
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mb-6 italic">"{dest.desc}"</p>
                  <button 
                    onClick={() => {
                      onExploreTopic(`Mohamed, parle-moi de cette destination : ${dest.title}. Donne-moi un itinéraire de rêve, tes secrets de local et tout ce qu'il faut savoir pour un voyage inoubliable.`);
                      onClose();
                    }}
                    className="w-full py-4 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all"
                  >
                    Découvrir ce trésor
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-10 bg-slate-950 rounded-[3rem] text-center text-white relative overflow-hidden">
             <div className="absolute inset-0 bg-indigo-600/10 blur-3xl"></div>
             <p className="relative z-10 text-xs font-medium italic opacity-60">"Le monde est un livre, et ceux qui ne voyagent pas n'en lisent qu'une page."</p>
             <p className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] mt-4 text-indigo-500">Prêt pour l'aventure ?</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TouristDiscovery;
