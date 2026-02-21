
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import React, { useEffect, useRef, useState } from 'react';
import { decode, decodeAudioData, createBlob } from '../services/audio-helpers';
import { Language, VoiceName, Emotion, VoiceConfig } from '../types';

const SAVANNA_AVATAR = "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=400&h=400";

interface VoiceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  voiceConfig: VoiceConfig;
  onOpenVoiceLab: () => void;
}

const AVAILABLE_BASE_VOICES: { name: VoiceName; label: string; color: string }[] = [
  { name: 'Zephyr', label: 'Zéphir', color: 'bg-emerald-500' },
  { name: 'Puck', label: 'Puck', color: 'bg-sky-400' },
  { name: 'Charon', label: 'Charon', color: 'bg-indigo-500' },
  { name: 'Kore', label: 'Kore', color: 'bg-amber-500' },
];

const VAD_THRESHOLD = 8;
const SILENCE_THRESHOLD_MS = 450;
const SAMPLE_RATE_IN = 16000;
const SAMPLE_RATE_OUT = 24000;

const VoiceOverlay: React.FC<VoiceOverlayProps> = ({ isOpen, onClose, language, voiceConfig, onOpenVoiceLab }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [uiState, setUiState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('NEUTRE');
  const [userVolume, setUserVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(false); 
  const [transcription, setTranscription] = useState('');
  const [userTranscription, setUserTranscription] = useState('');
  const [aiVolume, setAiVolume] = useState(0);
  
  const isMutedRef = useRef(false); 
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const analyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const volumeDataArrayRef = useRef<Uint8Array | null>(null);
  const outputVolumeDataArrayRef = useRef<Uint8Array | null>(null);
  const activeSessionRef = useRef<any>(null);
  
  const lastTimeSpokeRef = useRef<number>(Date.now());
  const smoothedVolumeRef = useRef(0);
  const smoothedAiVolumeRef = useRef(0);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (isOpen) {
      startVoiceChat(voiceConfig.name);
    } else {
      stopVoiceChat();
    }
    return () => stopVoiceChat();
  }, [isOpen, voiceConfig.name, voiceConfig.personality]); // Se relance si la personnalité change via le lab

  const updateVolume = () => {
    if (analyserRef.current) {
      if (!volumeDataArrayRef.current) {
        volumeDataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      }
      analyserRef.current.getByteFrequencyData(volumeDataArrayRef.current);
      
      let currentAvg = 0;
      const startBin = Math.floor(volumeDataArrayRef.current.length * 0.05);
      const endBin = Math.floor(volumeDataArrayRef.current.length * 0.45);
      for (let i = startBin; i < endBin; i++) currentAvg += volumeDataArrayRef.current[i];
      currentAvg /= (endBin - startBin);
      
      const factor = currentAvg > smoothedVolumeRef.current ? 0.3 : 0.1; 
      smoothedVolumeRef.current = smoothedVolumeRef.current * (1 - factor) + currentAvg * factor;
      setUserVolume(smoothedVolumeRef.current);

      const now = Date.now();
      const isActuallySpeaking = currentAvg > VAD_THRESHOLD && !isMutedRef.current;
      
      if (isActuallySpeaking) {
        if (uiState !== 'listening') setUiState('listening');
        lastTimeSpokeRef.current = now;
      } else if (uiState === 'listening' && (now - lastTimeSpokeRef.current > SILENCE_THRESHOLD_MS)) {
        setUiState('thinking');
      }
    }

    if (outputAnalyserRef.current) {
      if (!outputVolumeDataArrayRef.current) {
        outputVolumeDataArrayRef.current = new Uint8Array(outputAnalyserRef.current.frequencyBinCount);
      }
      outputAnalyserRef.current.getByteFrequencyData(outputVolumeDataArrayRef.current);
      
      let aiAvg = 0;
      const start = Math.floor(outputVolumeDataArrayRef.current.length * 0.1);
      const end = Math.floor(outputVolumeDataArrayRef.current.length * 0.6);
      for (let i = start; i < end; i++) aiAvg += outputVolumeDataArrayRef.current[i];
      aiAvg /= (end - start);
      
      const smoothingFactor = aiAvg > smoothedAiVolumeRef.current ? 0.4 : 0.15;
      smoothedAiVolumeRef.current = smoothedAiVolumeRef.current * (1 - smoothingFactor) + aiAvg * smoothingFactor;
      setAiVolume(smoothedAiVolumeRef.current);

      if (smoothedAiVolumeRef.current > 2) {
        if (uiState !== 'speaking') setUiState('speaking');
      } else if (uiState === 'speaking' && sourcesRef.current.size === 0) {
        setUiState('idle');
      }
    }

    animationFrameRef.current = requestAnimationFrame(updateVolume);
  };

  const startVoiceChat = async (voice: VoiceName) => {
    stopVoiceChat(false); 
    setStatus('connecting');
    setUiState('idle');
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: SAMPLE_RATE_IN });
    audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: SAMPLE_RATE_OUT });
    
    outputAnalyserRef.current = audioContextOutRef.current.createAnalyser();
    outputAnalyserRef.current.fftSize = 256;
    outputAnalyserRef.current.connect(audioContextOutRef.current.destination);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } 
      });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('connected');
            sessionPromise.then(session => activeSessionRef.current = session);

            if (audioContextInRef.current) {
              const ctx = audioContextInRef.current;
              const source = ctx.createMediaStreamSource(stream);
              analyserRef.current = ctx.createAnalyser();
              analyserRef.current.fftSize = 256;
              source.connect(analyserRef.current);
              
              updateVolume();

              const scriptProcessor = ctx.createScriptProcessor(4096, 1, 1);
              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.then(session => {
                  if (!isMutedRef.current) {
                    session.sendRealtimeInput({ media: pcmBlob });
                  }
                });
              };
              source.connect(scriptProcessor);
              scriptProcessor.connect(ctx.destination);
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              setUserTranscription(message.serverContent.inputTranscription.text);
              setUiState('listening');
            }
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              const emotionMatch = text.match(/\[ÉMOTION: (\w+)\]/);
              if (emotionMatch) setCurrentEmotion(emotionMatch[1] as Emotion);
              
              const cleanText = text.replace(/\[ÉMOTION: \w+\]\s*/, '');
              setTranscription(prev => prev + cleanText);
            }
            if (message.serverContent?.turnComplete) {
              setUserTranscription('');
              setTranscription('');
              setCurrentEmotion('NEUTRE');
            }

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextOutRef.current) {
              const ctx = audioContextOutRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, SAMPLE_RATE_OUT, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              
              source.connect(outputAnalyserRef.current!);
              
              source.onended = () => {
                sourcesRef.current.delete(source);
              };
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setTranscription('');
              setUiState('idle');
              setCurrentEmotion('NEUTRE');
            }
          },
          onerror: (e) => setStatus('disconnected'),
          onclose: () => setStatus('disconnected')
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } }
          },
          systemInstruction: `
Tu es Mohamed AI. Ton identité vocale est celle de : ${voiceConfig.personality}.

IDENTITÉ ET TON :
- Adopte rigoureusement le ton décrit ci-dessus : ${voiceConfig.personality}.
- Ta voix doit refléter cette âme à travers ton intonation et tes fillers.
- Tu restes Mohamed, le Diatigui bienveillant, mais avec ce caractère vocal spécifique.
- INTERACTION NATURELLE : Utilise des fillers (Euh..., Ah..., Walahi...) qui correspondent à ce personnage.

GESTION DES ÉMOTIONS :
Pour chaque réponse, commence par un tag émotionnel interne : [ÉMOTION: JOIE], [ÉMOTION: SAGESSE], [ÉMOTION: FIERTÉ], [ÉMOTION: EMPATHIE] ou [ÉMOTION: ÉNERGIE]. 
Adapte ton jeu vocal dynamiquement pour que l'utilisateur oublie qu'il parle à une machine.`,
        }
      });
    } catch (err) { 
      setStatus('disconnected'); 
    }
  };

  const stopVoiceChat = (fullStop = true) => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (activeSessionRef.current) {
      try { activeSessionRef.current.close(); } catch(e) {}
    }
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    if (audioContextInRef.current) audioContextInRef.current.close().catch(()=>{});
    if (audioContextOutRef.current) audioContextOutRef.current.close().catch(()=>{});
    if (fullStop) { 
      setStatus('disconnected'); 
      setUiState('idle');
      setTranscription('');
      setUserTranscription('');
      setUserVolume(0); 
      setAiVolume(0);
      setCurrentEmotion('NEUTRE');
    }
  };

  if (!isOpen) return null;

  const getThemeColor = () => {
    if (uiState === 'speaking') {
      switch(currentEmotion) {
        case 'JOIE': return 'rgba(251, 191, 36, 0.7)';
        case 'SAGESSE': return 'rgba(16, 185, 129, 0.7)';
        case 'FIERTÉ': return 'rgba(220, 38, 38, 0.7)';
        case 'EMPATHIE': return 'rgba(56, 189, 248, 0.7)';
        case 'ÉNERGIE': return 'rgba(139, 92, 246, 0.7)';
        default: return 'rgba(16, 185, 129, 0.6)';
      }
    }
    switch(uiState) {
      case 'listening': return 'rgba(14, 165, 233, 0.6)'; 
      case 'thinking': return 'rgba(245, 158, 11, 0.6)'; 
      default: return 'rgba(255, 255, 255, 0.05)';
    }
  };

  const getMorphSpeed = () => {
    if (uiState === 'speaking') {
      if (currentEmotion === 'JOIE' || currentEmotion === 'ÉNERGIE') return '6s';
      if (currentEmotion === 'SAGESSE' || currentEmotion === 'EMPATHIE') return '18s';
      return '12s';
    }
    return '15s';
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-1000 bg-slate-950 overflow-hidden`}>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 opacity-40 blur-[180px] transition-all duration-1000`}
             style={{ background: `radial-gradient(circle at 50% 40%, ${getThemeColor()}, transparent 60%)` }} />
        <div className="absolute inset-0 bogolan-pattern opacity-[0.03]" />
      </div>

      <div className="absolute top-8 left-0 right-0 px-10 flex items-center justify-between z-30">
        <div className="flex flex-col animate-in slide-in-from-top duration-700">
          <h1 className="text-xl font-black text-white tracking-tighter">MOHAMED <span className="text-theme-primary">AI</span></h1>
          <div className="flex items-center gap-2">
             <span className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.4em]">LIVE VOCAL ENGINE v8 — LABORATOIRE D'ÂMES</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-red-500 text-white rounded-xl transition-all border border-white/10 group">
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-4xl px-6 -translate-y-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute flex items-center justify-center pointer-events-none -z-10 scale-[1.6]">
             <svg viewBox="0 0 200 200" className="w-[600px] h-[600px] transition-all duration-300 opacity-80 overflow-visible">
                <path 
                  fill={getThemeColor()} 
                  d="M45.7,-77.2C59.4,-70.6,71.1,-59.5,78.8,-46.3C86.5,-33.1,90.3,-17.9,89.5,-2.9C88.6,12.1,83.1,27,74.7,39.6C66.3,52.2,55.1,62.6,42,69.5C28.8,76.4,13.7,79.9,-1.2,82C-16.1,84.1,-31.2,84.7,-44.6,78.8C-58,72.9,-69.7,60.5,-77.3,46.1C-84.9,31.7,-88.4,15.4,-88,0.2C-87.6,-14.9,-83.4,-29.1,-75.3,-41.8C-67.2,-54.5,-55.1,-65.7,-41.6,-72.4C-28.1,-79.1,-13.2,-81.4,1.1,-83.3C15.4,-85.2,32,-83.7,45.7,-77.2Z" 
                  transform="translate(100 100)"
                  className="animate-morph transition-all"
                  style={{
                    animationDuration: getMorphSpeed(),
                    transform: `translate(100px, 100px) scale(${1 + (uiState === 'speaking' ? aiVolume * 0.015 : uiState === 'listening' ? userVolume * 0.012 : 0)}) rotate(${Date.now() / 250}deg)`,
                    filter: `blur(15px) drop-shadow(0 0 ${uiState === 'speaking' ? aiVolume : 10}px ${getThemeColor()})`
                  }}
                />
             </svg>
          </div>

          <div className={`relative w-[230px] h-[230px] md:w-[300px] md:h-[300px] rounded-full p-2.5 bg-slate-900 shadow-2xl transition-all duration-700 overflow-visible
            ${uiState === 'speaking' ? 'ring-[15px] ring-white/10' : 
              uiState === 'listening' ? 'ring-[15px] ring-sky-500/30 scale-105' : 
              uiState === 'thinking' ? 'ring-[15px] ring-amber-500/30' : 'ring-1 ring-white/10'}`}>
            
            <div className="absolute -inset-6 rounded-full transition-all duration-1000 opacity-70 blur-3xl" style={{ backgroundColor: getThemeColor() }}></div>

            <div className="w-full h-full rounded-full overflow-hidden relative shadow-inner z-10 border-4 border-white/5">
              <img 
                src={SAVANNA_AVATAR} 
                alt="Mohamed" 
                className={`w-full h-full object-cover transition-all duration-[1200ms] ${uiState === 'thinking' ? 'scale-110 blur-[3px] grayscale' : 'scale-100 blur-0 grayscale-0'} ${currentEmotion === 'FIERTÉ' ? 'saturate-150' : ''}`} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/10 opacity-50 mix-blend-overlay" />
            </div>
          </div>
        </div>

        <div className="h-[160px] w-full flex flex-col items-center justify-center space-y-4 px-6 text-center max-w-2xl relative z-20">
           <div className="space-y-3">
             {userTranscription && (
               <div className="bg-sky-500/15 border border-sky-500/30 px-6 py-3 rounded-[2.5rem] backdrop-blur-3xl animate-in zoom-in duration-500 shadow-xl">
                 <p className="text-sky-300 font-bold italic text-base tracking-tight leading-tight">"{userTranscription}"</p>
               </div>
             )}
             
             {transcription && (
               <div className={`px-10 py-6 rounded-[3rem] backdrop-blur-3xl shadow-2xl border-2 transition-all duration-500 animate-in slide-in-from-bottom-6 ${currentEmotion === 'JOIE' ? 'bg-amber-500/15 border-amber-500/40' : 'bg-white/10 border-white/20'}`}>
                 <p className="text-white font-black text-2xl lg:text-3xl leading-tight tracking-tight drop-shadow-lg">
                   {transcription}
                 </p>
               </div>
             )}
           </div>

           {!userTranscription && !transcription && uiState === 'idle' && (
             <div className="flex flex-col items-center gap-2">
               <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[11px] animate-pulse">Mohamed t'écoute, mon ami...</p>
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic bg-white/5 px-4 py-1.5 rounded-full border border-white/10">{voiceConfig.personality}</span>
             </div>
           )}
        </div>
      </div>

      <div className="absolute bottom-10 flex flex-col items-center gap-8 z-30 w-full px-6">
        
        {/* Barre de sélection de voix intégrée */}
        <div className="flex items-center gap-2 bg-white/5 p-2 rounded-[2.8rem] border border-white/10 backdrop-blur-2xl shadow-3xl">
          <button 
            onClick={onOpenVoiceLab}
            className="w-14 h-14 rounded-full bg-theme-primary/20 text-white flex items-center justify-center text-2xl hover:bg-theme-primary transition-all shadow-lg border border-theme-primary/40 group relative"
            title="Laboratoire Vocal"
          >
            <span className="group-hover:rotate-12 transition-transform">🧬</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-theme-accent rounded-full animate-ping"></div>
          </button>

          <div className="w-[1px] h-8 bg-white/10 mx-1"></div>

          {AVAILABLE_BASE_VOICES.map((v) => (
            <button
              key={v.name}
              onClick={() => {}} // Changement via le lab uniquement ou désactivé ici si on veut forcer le lab
              className={`px-6 py-3 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${voiceConfig.name === v.name ? `${v.color} text-white shadow-xl scale-105` : 'text-slate-400 opacity-40 cursor-not-allowed'}`}
              disabled={voiceConfig.name !== v.name}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-12">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-18 h-18 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all shadow-3xl ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'}`}
          >
            {isMuted ? <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg> : <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>}
          </button>
          <button 
            onClick={onClose}
            className="w-22 h-22 md:w-24 md:h-24 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-all shadow-[0_0_60px_rgba(220,38,38,0.5)] hover:scale-115 active:scale-95 group"
          >
            <svg className="w-10 h-10 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.987.987 0 010-1.4c3.07-2.93 7.32-4.68 11.71-4.68s8.64 1.75 11.71 4.68c.39.39.39 1.02 0 1.41l-2.48 2.48c-.18.18-.43.29-.71.29s-.53-.11-.7-.29c-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
          </button>
        </div>
      </div>

      <style>{`
        .bogolan-pattern { background-image: url('https://www.transparenttextures.com/patterns/cubes.png'); }
        @keyframes morph {
          0%, 100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
          33% { border-radius: 70% 30% 50% 50% / 30% 60% 40% 70%; }
          66% { border-radius: 50% 50% 30% 70% / 60% 40% 70% 30%; }
        }
        .animate-morph { animation: morph 15s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default VoiceOverlay;
