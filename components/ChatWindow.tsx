
import { Message, SUPPORTED_LANGUAGES, Language, VoiceName, Emotion, VoiceConfig } from '../types';
import React, { useEffect, useRef, useState } from 'react';
import { generateSpeech } from '../services/gemini';
import { decode, decodeAudioData } from '../services/audio-helpers';

const SAVANNA_AVATAR = "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=150&h=150";

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  videoProgress?: string | null;
  languageName: string;
  wallpaper?: string | null;
  translationTarget: Language | null;
  voiceConfig: VoiceConfig;
}

const getEmotionStyle = (emotion?: Emotion) => {
  switch(emotion) {
    case 'JOIE': return 'border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.15)] bg-amber-500/5';
    case 'SAGESSE': return 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.15)] bg-emerald-500/5';
    case 'FIERTÉ': return 'border-red-600 shadow-[0_0_25px_rgba(220,38,38,0.15)] bg-red-600/5';
    case 'EMPATHIE': return 'border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.15)] bg-sky-500/5';
    case 'ÉNERGIE': return 'border-violet-500 shadow-[0_0_25px_rgba(139,92,246,0.15)] bg-violet-500/5';
    default: return 'border-slate-300 dark:border-slate-800';
  }
};

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  messages, onSendMessage, isLoading, videoProgress, wallpaper, translationTarget, voiceConfig
}) => {
  const [inputText, setInputText] = useState('');
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("Mohamed prépare sa réponse...");

  const LOADING_MESSAGES = [
    "Mohamed cherche ses mots...",
    "Un instant mon ami...",
    "Walahi, laisse-moi réfléchir...",
    "Je prépare ma réponse..."
  ];

  useEffect(() => {
    if (isLoading) {
      setLoadingMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    }
  }, [isLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, videoProgress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const stopCurrentAudio = () => {
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch(e) {}
      currentSourceRef.current = null;
    }
    setPlayingMessageId(null);
  };

  const handleSpeech = async (message: Message) => {
    if (playingMessageId === message.id) {
      stopCurrentAudio();
      return;
    }
    stopCurrentAudio();
    setPlayingMessageId(message.id);
    
    // On utilise la config vocale personnalisée
    const base64Audio = await generateSpeech(
      message.text, 
      voiceConfig.name, 
      message.emotion, 
      voiceConfig.personality
    );

    if (base64Audio) {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const ctx = audioContextRef.current;
      const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => { if (playingMessageId === message.id) setPlayingMessageId(null); };
      currentSourceRef.current = source;
      source.start();
    } else {
      setPlayingMessageId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-theme-bg relative">
      {wallpaper && (
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out z-0" 
          style={{ backgroundImage: `url(${wallpaper})`, filter: 'brightness(0.9) saturate(1.1)' }} />
      )}
      {wallpaper ? <div className="absolute inset-0 bg-white/30 dark:bg-black/60 backdrop-blur-[2px] pointer-events-none z-0" /> : <div className="absolute inset-0 bg-theme-bg z-0" />}

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-10 custom-scrollbar relative z-10 scroll-smooth">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-message-bloom`}>
            <div className={`max-w-[92%] md:max-w-[80%] flex gap-3 md:gap-6 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-10 h-10 md:w-14 md:h-14 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl transition-all border-2 ${message.role === 'user' ? 'bg-theme-secondary border-white' : 'border-theme-primary bg-white'}`}>
                {message.role === 'user' ? <div className="w-full h-full flex items-center justify-center text-white font-black text-xs">MOI</div> : <img src={SAVANNA_AVATAR} alt="M" className={`w-full h-full object-cover transition-all duration-1000 ${message.emotion === 'FIERTÉ' ? 'saturate-150' : ''}`} />}
              </div>
              <div className={`relative px-5 py-4 md:px-8 md:py-6 rounded-[2rem] shadow-2xl transition-all border-2 ${message.role === 'user' ? 'bg-theme-primary/95 text-white rounded-tr-none border-theme-accent/50' : `bg-theme-surface/95 text-theme-text rounded-tl-none border-l-[6px] md:border-l-[8px] ${getEmotionStyle(message.emotion)}`}`}>
                
                {message.role === 'model' && (
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-primary flex items-center gap-3">
                      MOHAMED
                      {playingMessageId === message.id && (
                        <div className="flex items-end gap-1 h-3 ml-2">
                          <div className="w-1 bg-theme-accent animate-bounce h-2"></div>
                          <div className="w-1 bg-theme-accent animate-bounce h-3 [animation-delay:-0.2s]"></div>
                          <div className="w-1 bg-theme-accent animate-bounce h-2.5 [animation-delay:-0.4s]"></div>
                        </div>
                      )}
                    </div>
                    <button onClick={() => handleSpeech(message)} className={`p-2 rounded-xl transition-all ${playingMessageId === message.id ? 'bg-red-500 text-white shadow-lg' : 'hover:bg-theme-primary/10 hover:text-theme-primary text-slate-400'}`}>
                      {playingMessageId === message.id ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" /></svg> : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>}
                    </button>
                  </div>
                )}

                <div className="whitespace-pre-wrap text-[15px] md:text-[17px] leading-relaxed font-semibold">{message.text}</div>
                
                {message.imageUrl && <div className="mt-5 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/20 hover:scale-[1.02] transition-transform duration-500"><img src={message.imageUrl} alt="Art" className="w-full" /></div>}
                {message.videoUrl && <div className="mt-5 rounded-[2.5rem] overflow-hidden shadow-2xl bg-black aspect-video border-4 border-white/20"><video src={message.videoUrl} controls className="w-full h-full" /></div>}
                
                {message.groundingChunks && message.groundingChunks.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-3">
                      <svg className="w-4 h-4 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                      SOURCES AUTHENTIQUES
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {message.groundingChunks.map((chunk, idx) => {
                        const item = chunk.web || chunk.maps;
                        if (!item) return null;
                        return (
                          <a 
                            key={idx}
                            href={item.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-theme-primary hover:text-white rounded-[1.2rem] transition-all border border-slate-200 dark:border-slate-700 group hover:scale-105"
                          >
                            <span className="text-[11px] font-black truncate max-w-[180px] uppercase tracking-tighter">{item.title || 'Lien source'}</span>
                            <svg className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className={`text-[9px] mt-4 font-black tracking-[0.2em] uppercase opacity-40 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-message-bloom">
            <div className="flex items-center gap-5">
               <div className="w-12 h-12 md:w-14 md:h-14 rounded-3xl overflow-hidden shadow-2xl animate-spirit-pulse bg-white border-2 border-theme-accent/50">
                  <img src={SAVANNA_AVATAR} alt="M" className="w-full h-full object-cover grayscale" />
               </div>
               <div className="bg-theme-surface/90 px-8 py-5 rounded-[2rem] shadow-xl border-2 border-slate-100 dark:border-slate-800 italic font-black text-theme-primary tracking-tight">
                 <div className="flex items-center gap-3">
                    <span className="animate-pulse">{loadingMsg}</span>
                    <div className="flex gap-1">
                       <div className="w-1.5 h-1.5 bg-theme-primary rounded-full animate-bounce"></div>
                       <div className="w-1.5 h-1.5 bg-theme-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                       <div className="w-1.5 h-1.5 bg-theme-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-12" />
      </div>

      <div className="p-4 md:p-10 bg-theme-surface/80 border-t-2 border-slate-200 dark:border-slate-800 z-20 backdrop-blur-3xl relative">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto flex gap-4">
          <input 
            type="text" 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            placeholder="Dis-moi tout mon ami..." 
            className="flex-1 bg-slate-100 dark:bg-slate-900 border-2 border-transparent focus:border-theme-primary rounded-[1.8rem] px-8 py-5 outline-none font-bold shadow-inner transition-all text-lg" 
            disabled={isLoading} 
          />
          <button 
            type="submit" 
            disabled={!inputText.trim() || isLoading} 
            className="px-8 md:px-14 py-4 rounded-[1.8rem] font-black text-[12px] uppercase tracking-[0.2em] bg-theme-primary text-white hover:bg-theme-secondary hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 shadow-xl disabled:opacity-30 disabled:pointer-events-none group"
          >
            <span className="group-hover:translate-x-1 transition-transform inline-block">Envoyer</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
