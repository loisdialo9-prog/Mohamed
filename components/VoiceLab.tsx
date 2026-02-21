
import React, { useState } from 'react';
import { VoiceName, VoiceConfig } from '../types';
import { generateSpeech } from '../services/gemini';
import { decode, decodeAudioData } from '../services/audio-helpers';

interface VoiceLabProps {
  isOpen: boolean;
  onClose: () => void;
  config: VoiceConfig;
  onSave: (config: VoiceConfig) => void;
}

const BASE_VOICES: { id: VoiceName; label: string; desc: string; icon: string }[] = [
  { id: 'Zephyr', label: 'Zéphir', desc: 'Équilibré & Chaleureux', icon: '🍃' },
  { id: 'Puck', label: 'Puck', desc: 'Vif & Jeune', icon: '⚡' },
  { id: 'Charon', label: 'Charon', desc: 'Profond & Calme', icon: '🌑' },
  { id: 'Kore', label: 'Kore', desc: 'Doux & Maternel', icon: '✨' },
  { id: 'Fenrir', label: 'Fenrir', desc: 'Autoritaire & Puissant', icon: '🐺' },
];

const SUGGESTED_PERSONAS = [
  "Un vieux sage malien de Tombouctou",
  "Une jeune guide dynamique de Bamako",
  "Un griot traditionnel racontant des épopées",
  "Une grand-mère douce sous le manguier",
  "Un jeune entrepreneur tech africain",
  "Un poète rêveur de la boucle du Niger"
];

const VoiceLab: React.FC<VoiceLabProps> = ({ isOpen, onClose, config, onSave }) => {
  const [tempConfig, setTempConfig] = useState<VoiceConfig>(config);
  const [isTesting, setIsTesting] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  if (!isOpen) return null;

  const handleTestVoice = async () => {
    setIsTesting(true);
    const text = "Walahi, écoute ma nouvelle voix. Qu'en penses-tu, mon ami ?";
    const base64 = await generateSpeech(text, tempConfig.name, 'NEUTRE', tempConfig.personality);
    
    if (base64) {
      let ctx = audioContext;
      if (!ctx) {
        ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        setAudioContext(ctx);
      }
      const buffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsTesting(false);
      source.start();
    } else {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border-2 border-theme-primary/20 animate-in zoom-in duration-300">
        
        {/* Header Cinématique */}
        <div className="p-8 bg-gradient-to-br from-theme-primary to-theme-secondary text-white relative">
           <div className="absolute top-0 right-0 p-6 opacity-20"><span className="text-8xl">🧬</span></div>
           <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">Laboratoire <span className="text-theme-accent">Vocal</span></h2>
           <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">Forge l'âme sonore de Mohamed AI</p>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Étape 1: Voix de Base */}
          <section className="space-y-4">
             <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest px-2">1. Choisir l'ADN de base</h3>
             <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
               {BASE_VOICES.map((v) => (
                 <button 
                  key={v.id}
                  onClick={() => setTempConfig({ ...tempConfig, name: v.id })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border-2 ${tempConfig.name === v.id ? 'bg-theme-primary/10 border-theme-primary shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-transparent hover:border-slate-200'}`}
                 >
                   <span className="text-2xl">{v.icon}</span>
                   <span className="text-[10px] font-black uppercase">{v.label}</span>
                 </button>
               ))}
             </div>
          </section>

          {/* Étape 2: Personnalité */}
          <section className="space-y-4">
             <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest px-2">2. Injecter une Aura de Personnalité</h3>
             <textarea 
               value={tempConfig.personality}
               onChange={(e) => setTempConfig({ ...tempConfig, personality: e.target.value })}
               placeholder="Décris son identité vocale... (Ex: Une voix grave de vieux sage malien)"
               className="w-full h-24 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-theme-primary rounded-2xl p-4 font-bold outline-none transition-all"
             />
             <div className="flex flex-wrap gap-2">
               {SUGGESTED_PERSONAS.map(p => (
                 <button 
                  key={p} 
                  onClick={() => setTempConfig({ ...tempConfig, personality: p })}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[9px] font-black uppercase tracking-wider text-slate-500 hover:bg-theme-primary hover:text-white transition-all"
                 >
                   {p}
                 </button>
               ))}
             </div>
          </section>

          {/* Action de Test */}
          <div className="flex items-center gap-4 pt-4">
            <button 
              onClick={handleTestVoice}
              disabled={isTesting}
              className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isTesting ? 'bg-slate-100 text-slate-400' : 'bg-theme-accent text-slate-900 shadow-xl shadow-theme-accent/20 hover:scale-[1.02]'}`}
            >
              {isTesting ? (
                <>
                  <div className="flex gap-1 h-3 items-end">
                    <div className="w-1 bg-slate-400 h-2 animate-bounce"></div>
                    <div className="w-1 bg-slate-400 h-3 animate-bounce [animation-delay:-0.2s]"></div>
                    <div className="w-1 bg-slate-400 h-2 animate-bounce [animation-delay:-0.4s]"></div>
                  </div>
                  TEST EN COURS...
                </>
              ) : (
                <>
                  <span>🔊 ÉCOUTER L'ÉCHANTILLON</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer avec Sauvegarde */}
        <div className="p-8 bg-slate-50 dark:bg-slate-950 border-t-2 border-slate-100 dark:border-slate-800 flex gap-4">
           <button onClick={onClose} className="px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500">Annuler</button>
           <button 
            onClick={() => { onSave(tempConfig); onClose(); }}
            className="flex-1 py-4 bg-theme-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-theme-primary/20 hover:bg-theme-secondary transition-all"
           >
             SAUVEGARDER CETTE ÂME VOCALE
           </button>
        </div>

      </div>
    </div>
  );
};

export default VoiceLab;
