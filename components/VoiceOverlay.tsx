
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, Type, FunctionDeclaration } from '@google/genai';
import { Language } from '../types';
import { decode, decodeAudioData, createBlob } from '../services/audio-helpers';

interface VoiceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

type VoiceName = 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';

const AVAILABLE_VOICES: { name: VoiceName; label: string; color: string; desc: string }[] = [
  { name: 'Zephyr', label: 'Zéphir', color: 'bg-green-500', desc: 'Neutre et clair' },
  { name: 'Puck', label: 'Puck', color: 'bg-blue-400', desc: 'Jeune et dynamique' },
  { name: 'Charon', label: 'Charon', color: 'bg-purple-500', desc: 'Mature et posé' },
  { name: 'Kore', label: 'Kore', color: 'bg-orange-500', desc: 'Féminin et doux' },
  { name: 'Fenrir', label: 'Fenrir', color: 'bg-slate-600', desc: 'Profond et grave' },
];

const VoiceOverlay: React.FC<VoiceOverlayProps> = ({ isOpen, onClose, language }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<VoiceName>('Zephyr');
  
  const sessionRef = useRef<any>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isChangingVoiceRef = useRef(false);

  const changeVoiceFunction: FunctionDeclaration = {
    name: 'changeVoice',
    parameters: {
      type: Type.OBJECT,
      description: 'Permet de changer la voix de l\'assistant parmi les options disponibles.',
      properties: {
        voiceName: {
          type: Type.STRING,
          description: 'Le nom de la voix à utiliser : Zephyr, Puck, Charon, Kore, ou Fenrir.',
          enum: ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir']
        },
      },
      required: ['voiceName'],
    },
  };

  useEffect(() => {
    if (isOpen) {
      startVoiceChat(currentVoice);
    } else {
      stopVoiceChat();
    }
    return () => {
      stopVoiceChat();
    };
  }, [isOpen, currentVoice]);

  const startVoiceChat = async (voice: VoiceName) => {
    if (isChangingVoiceRef.current) return;
    
    stopVoiceChat(false); 
    setStatus('connecting');
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

    audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('connected');
            if (audioContextInRef.current) {
              const source = audioContextInRef.current.createMediaStreamSource(stream);
              const scriptProcessor = audioContextInRef.current.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.then(session => {
                  if (session && status === 'connected') {
                    session.sendRealtimeInput({ media: pcmBlob });
                  }
                });
              };
              
              source.connect(scriptProcessor);
              scriptProcessor.connect(audioContextInRef.current.destination);
            }
          },
          onmessage: async (message) => {
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'changeVoice') {
                  const newVoice = fc.args.voiceName as VoiceName;
                  sessionPromise.then(session => {
                    session.sendToolResponse({
                      functionResponses: { id: fc.id, name: fc.name, response: { result: "ok" } }
                    });
                  });
                  setTimeout(() => {
                    setCurrentVoice(newVoice);
                  }, 500);
                }
              }
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextOutRef.current) {
              setIsSpeaking(true);
              const ctx = audioContextOutRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              try {
                const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.onended = () => {
                  sourcesRef.current.delete(source);
                  if (sourcesRef.current.size === 0) setIsSpeaking(false);
                };
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
              } catch (err) {
                console.error("Audio Decoding Error:", err);
              }
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onerror: (e) => {
            console.error("Live Error:", e);
            setStatus('disconnected');
          },
          onclose: () => {
            setStatus('disconnected');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
          },
          tools: [{ functionDeclarations: [changeVoiceFunction] }],
          systemInstruction: `Tu es Mohamed AI, créé par Mahamed. Tu es en mode conversation vocale temps réel. 
          Parle EXCLUSIVEMENT en ${language.name}. Sois chaleureux, concis et réactif.
          IMPORTANT : Si l'utilisateur te demande de changer de voix ou de prendre une voix différente (plus grave, plus féminine, etc.), utilise la fonction "changeVoice" avec l'une des options : Zephyr (actuelle), Puck, Charon, Kore, ou Fenrir.`,
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start voice chat:", err);
      setStatus('disconnected');
    }
  };

  const stopVoiceChat = (fullStop = true) => {
    if (sessionRef.current) {
      sessionRef.current = null;
    }
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();

    if (audioContextInRef.current && audioContextInRef.current.state !== 'closed') {
      audioContextInRef.current.close().catch(console.error);
      audioContextInRef.current = null;
    }

    if (audioContextOutRef.current && audioContextOutRef.current.state !== 'closed') {
      audioContextOutRef.current.close().catch(console.error);
      audioContextOutRef.current = null;
    }

    if (fullStop) {
      setStatus('disconnected');
      setIsSpeaking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-green-900/95 backdrop-blur-xl text-white animate-in fade-in duration-300">
      <div className="absolute top-8 right-8">
        <button 
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-center gap-8 max-w-md text-center px-6">
        <div className="relative">
          <div className={`absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-20 animate-pulse scale-150 ${isSpeaking ? 'duration-75' : 'duration-1000'}`}></div>
          <div className={`absolute inset-0 bg-green-300 rounded-full blur-xl opacity-30 animate-ping ${isSpeaking ? 'inline-block' : 'hidden'}`}></div>
          
          <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl overflow-hidden">
            <span className="text-5xl font-bold text-green-600">M</span>
            {isSpeaking && (
               <div className="absolute bottom-4 flex gap-1">
                 {[1,2,3,4,5].map(i => (
                   <div key={i} className="w-1 bg-green-500 rounded-full animate-bounce" style={{ height: `${Math.random()*20 + 5}px`, animationDelay: `${i*0.1}s` }}></div>
                 ))}
               </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-2 heading-font">Mohamed AI Vocale</h2>
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
            <span className="text-xs font-bold opacity-80 uppercase tracking-tighter">
              {status === 'connecting' ? 'Initialisation...' : status === 'connected' ? 'En ligne' : 'Déconnecté'}
            </span>
          </div>
        </div>

        <div className="w-full space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-200/60">Choisissez ma voix</p>
          <div className="flex justify-center gap-3">
            {AVAILABLE_VOICES.map((v) => (
              <button
                key={v.name}
                onClick={() => setCurrentVoice(v.name)}
                className={`group relative flex flex-col items-center gap-2 transition-all ${currentVoice === v.name ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}
              >
                <div className={`w-12 h-12 rounded-full ${v.color} border-2 ${currentVoice === v.name ? 'border-white shadow-lg' : 'border-transparent'} flex items-center justify-center transition-all`}>
                  <span className="text-white text-[10px] font-black">{v.label[0]}</span>
                </div>
                <span className={`text-[8px] font-bold uppercase transition-colors ${currentVoice === v.name ? 'text-white' : 'text-white/50'}`}>{v.label}</span>
                {currentVoice === v.name && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-[10px] italic text-green-100/40">Vous pouvez aussi me demander de changer de voix à l'oral !</p>
        </div>

        <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-md">
           <p className="text-sm italic text-green-50/70 leading-relaxed font-medium">
             "I ni ce ! Je suis Mohamed AI, conçu par Mahamed. Je suis là pour vous écouter, en {language.name}."
           </p>
        </div>
        
        <button 
          onClick={onClose}
          className="px-8 py-4 bg-red-500 hover:bg-red-600 rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-3"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm7 7a1 1 0 011 1v1h1a1 1 0 110 2H9a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Mettre fin à l'appel
        </button>
      </div>
    </div>
  );
};

export default VoiceOverlay;
