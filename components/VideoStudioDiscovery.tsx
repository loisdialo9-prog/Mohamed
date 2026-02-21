
import React, { useState, useEffect } from 'react';
import { generateVideo } from '../services/gemini';

interface VideoStudioDiscoveryProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVideoToChat: (videoUrl: string, prompt: string) => void;
}

const VIDEO_SUGGESTIONS = [
  "Une caravane de dromadaires au Sahara",
  "Un marché flottant sur le Niger",
  "Un danseur Dogon sous un baobab",
  "Bamako illuminée la nuit",
  "Un artisan malien sculptant un masque",
];

const VideoStudioDiscovery: React.FC<VideoStudioDiscoveryProps> = ({ isOpen, onClose, onAddVideoToChat }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
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

  const handleGenerate = async (suggestedPrompt?: string) => {
    const finalPrompt = suggestedPrompt || prompt;
    if (!finalPrompt.trim()) return;

    if (!hasUserKey) {
      await handleOpenKey();
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    try {
      const url = await generateVideo(finalPrompt, '16:9', setStatusMessage);
      setVideoUrl(url);
    } catch (err: any) {
      setError("Walahi, la vidéo demande une clé Pro active. Vérifie tes paramètres.");
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full md:w-[550px] h-full bg-slate-950 shadow-2xl animate-in slide-in-from-right flex flex-col border-l-8 border-indigo-500">
        <div className="p-8 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between mb-4">
             <span className="text-4xl">🎥</span>
             <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">STUDIO <br/><span className="text-indigo-500 italic">CINÉMA</span></h2>
          <div className="mt-2">
            {!hasUserKey ? (
              <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 p-2 rounded-lg">Clé Pro requise pour la vidéo</p>
            ) : (
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Mode Cinéma Prêt</p>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {!hasUserKey ? (
            <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 text-center space-y-6">
              <p className="text-slate-300 font-bold leading-relaxed">Le Studio Cinéma (Veo) nécessite une clé API personnelle avec facturation activée pour fonctionner. Walahi, c'est du grand art !</p>
              <button onClick={handleOpenKey} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest shadow-lg">Activer le Mode Pro</button>
            </div>
          ) : (
            <div className="space-y-6">
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Décris ta scène..." className="w-full h-32 bg-white/5 border-2 border-white/10 rounded-3xl p-5 text-white outline-none focus:border-indigo-500 transition-all resize-none" />
              <button onClick={() => handleGenerate()} disabled={isGenerating || !prompt.trim()} className="w-full py-4 bg-indigo-500 text-white font-black rounded-2xl uppercase tracking-widest shadow-xl">
                {isGenerating ? "ACTION..." : "TOURNER LE FILM"}
              </button>
            </div>
          )}

          {!videoUrl && !isGenerating && hasUserKey && (
            <div className="space-y-2">
              <h3 className="text-[10px] font-black uppercase text-slate-400 px-2">Inspirations</h3>
              {VIDEO_SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => { setPrompt(s); handleGenerate(s); }} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold text-slate-300 hover:bg-indigo-500 text-left transition-all">{s}</button>
              ))}
            </div>
          )}

          {isGenerating && (
            <div className="text-center p-12">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white font-black">{statusMessage || "On tourne !"}</p>
            </div>
          )}
          
          {videoUrl && (
            <div className="space-y-4 animate-in zoom-in">
              <video src={videoUrl} controls autoPlay className="w-full rounded-2xl border-4 border-indigo-500 shadow-2xl" />
              <button onClick={() => onAddVideoToChat(videoUrl, prompt)} className="w-full py-4 bg-green-600 text-white font-black rounded-2xl uppercase shadow-xl">Ajouter à la palabre</button>
            </div>
          )}
          
          {error && <div className="p-4 bg-red-500/10 text-red-400 text-center rounded-2xl font-bold border border-red-500/20">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default VideoStudioDiscovery;
