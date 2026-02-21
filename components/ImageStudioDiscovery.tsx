
import React, { useState, useEffect } from 'react';
import { generateImage } from '../services/gemini';

interface ImageStudioDiscoveryProps {
  isOpen: boolean;
  onClose: () => void;
  onAddImageToChat: (imageUrl: string, prompt: string) => void;
}

const SUGGESTIONS = [
  "Une caravane de dromadaires traversant les dunes dorées du Sahara",
  "Un astronaute malien sur Mars, reflet de la terre dans son casque",
  "Un lion majestueux assis sur un trône en or",
  "Portrait de Nelson Mandela souriant",
  "Une ville futuriste africaine flottante",
  "Nature morte de fruits tropicaux"
];

const ImageStudioDiscovery: React.FC<ImageStudioDiscoveryProps> = ({ isOpen, onClose, onAddImageToChat }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ url: string; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasUserKey, setHasUserKey] = useState(false);

  useEffect(() => {
    checkKey();
  }, [isOpen]);

  const checkKey = async () => {
    if ((window as any).aistudio?.hasSelectedApiKey) {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasUserKey(selected);
    }
  };

  const handleOpenKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setHasUserKey(true);
    }
  };

  const handleGenerate = async (text?: string) => {
    const finalPrompt = text || prompt;
    if (!finalPrompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const res = await generateImage(finalPrompt, hasUserKey);
      if (res.imageUrl) {
        setResult({ url: res.imageUrl, text: res.text });
      } else {
        setError(res.text.includes("Mode Pro") ? res.text : "Walahi, j'ai eu un souci avec le rendu de l'image.");
      }
    } catch (err: any) {
      setError("Désolé, Mohamed est fatigué. Réessaie dans un instant.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full md:w-[500px] h-full bg-slate-950 shadow-2xl animate-in slide-in-from-right flex flex-col border-l-8 border-emerald-500">
        
        <div className="p-8 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between mb-4">
             <span className="text-4xl">🔮</span>
             <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">STUDIO <br/><span className="text-emerald-500 italic">UNIVERSEL</span></h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${hasUserKey ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
              {hasUserKey ? 'Mode Pro (2K)' : 'Mode Standard'}
            </span>
            {!hasUserKey && (
              <button onClick={handleOpenKey} className="text-[8px] font-black text-emerald-500 uppercase underline hover:text-white">Passer en Pro</button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <div className="space-y-4">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Décris ton image..."
              className="w-full h-32 bg-white/5 border-2 border-white/10 rounded-3xl p-5 text-white font-bold outline-none focus:border-emerald-500 transition-all resize-none shadow-inner"
            />
            <button 
              onClick={() => handleGenerate()}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${isGenerating ? 'bg-slate-800 text-slate-500' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'}`}
            >
              {isGenerating ? "CRÉATION EN COURS..." : "GÉNÉRER L'IMAGE"}
            </button>
          </div>

          {!result && !isGenerating && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Inspirations</h3>
              <div className="grid grid-cols-1 gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => { setPrompt(s); handleGenerate(s); }} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold text-slate-300 hover:bg-emerald-500/20 hover:text-white transition-all text-left truncate">{s}</button>
                ))}
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="text-center p-12 space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-white font-black italic">Mohamed prépare le pinceau...</p>
            </div>
          )}

          {error && (
            <div className="p-6 bg-red-500/10 border-2 border-red-500/20 rounded-3xl text-center">
               <p className="text-red-400 font-bold text-sm">{error}</p>
               {error.includes("Pro") && (
                 <button onClick={handleOpenKey} className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase">Activer le Mode Pro</button>
               )}
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in zoom-in">
               <img src={result.url} alt="Création" className="w-full rounded-[2.5rem] border-4 border-emerald-500 shadow-2xl" />
               <button onClick={() => onAddImageToChat(result.url, prompt)} className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl uppercase tracking-widest shadow-xl">Ajouter à la palabre</button>
               <button onClick={() => { setResult(null); setPrompt(''); }} className="w-full text-slate-500 font-black text-[10px] uppercase">Nouvelle création</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageStudioDiscovery;
