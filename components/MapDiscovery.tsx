
import React, { useState, useEffect, useRef } from 'react';
import { generateSpeech } from '../services/gemini';
import { decode, decodeAudioData } from '../services/audio-helpers';
import { VoiceName } from '../types';

interface MapDiscoveryProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreTopic: (topic: string) => void;
}

type MapMode = '2D' | 'SATELLITE' | '3D';

interface TripStop {
  name: string;
  lat: number;
  lng: number;
  zoom: number;
  pitch: number;
  heading: number;
  icon: string;
  country: string;
  narration: string;
}

const VIRTUAL_TRIP_STOPS: TripStop[] = [
  { 
    name: 'Bamako : Pont Fahd', 
    lat: 12.634, lng: -7.998, zoom: 16, pitch: 45, heading: 0,
    icon: '🌉', country: 'Mali',
    narration: "Walahi, bienvenue à Bamako ! Le Pont Fahd est le cœur battant de notre capitale. Regarde le fleuve Niger, notre 'Djoliba', qui coule tranquillement en dessous. C'est ici que la ville respire."
  },
  { 
    name: 'Djenné : Grande Mosquée', 
    lat: 13.905, lng: -4.555, zoom: 18, pitch: 60, heading: 45,
    icon: '🕌', country: 'Mali',
    narration: "Admire ce chef-d'œuvre ! C'est le plus grand édifice en terre crue au monde. Chaque année, toute la ville se réunit pour le 'crépissage', une fête immense où l'on prend soin de notre histoire."
  },
  { 
    name: 'Tombouctou : Cité des Saints', 
    lat: 16.776, lng: -3.007, zoom: 18, pitch: 30, heading: 120,
    icon: '📜', country: 'Mali',
    narration: "Tombouctou, la cité mystérieuse. Ici, la connaissance est plus précieuse que l'or. Les manuscrits que tu vois autour de nous datent de plusieurs siècles et contiennent toute la sagesse du monde."
  },
  { 
    name: 'Lalibela : Églises de Roc', 
    lat: 12.031, lng: 39.041, zoom: 19, pitch: 75, heading: 0,
    icon: '⛪', country: 'Éthiopie',
    narration: "Nous avons volé vers l'Est, en Éthiopie. Ces églises n'ont pas été bâties, elles ont été sculptées à même le sol volcanique. Un travail de titans, fait avec une foi inébranlable."
  },
  { 
    name: 'Chutes Victoria', 
    lat: -17.924, lng: 25.857, zoom: 16, pitch: 45, heading: 180,
    icon: '🌊', country: 'Zambie/Zimbabwe',
    narration: "Écoute ce fracas ! C'est 'Mosi-oa-Tunya', la fumée qui gronde. La puissance de l'eau ici te rappelle que la nature africaine est une reine indomptable."
  },
  { 
    name: 'Table Mountain', 
    lat: -33.962, lng: 18.413, zoom: 15, pitch: 60, heading: 270,
    icon: '⛰️', country: 'Afrique du Sud',
    narration: "Le bout du monde ! Table Mountain surplombe Le Cap. Regarde vers l'horizon, c'est là que l'Atlantique et l'Indien se rencontrent dans une étreinte éternelle."
  }
];

const SAVANNA_AVATAR = "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=150&h=150";

const MapDiscovery: React.FC<MapDiscoveryProps> = ({ isOpen, onClose, onExploreTopic }) => {
  const [viewMode, setViewMode] = useState<MapMode>('3D');
  const [isVirtualTrip, setIsVirtualTrip] = useState(false);
  const [tripIndex, setTripIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const [zoom, setZoom] = useState(VIRTUAL_TRIP_STOPS[0].zoom);
  const [heading, setHeading] = useState(VIRTUAL_TRIP_STOPS[0].heading);
  const [pitch, setPitch] = useState(VIRTUAL_TRIP_STOPS[0].pitch);

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const currentLoc = VIRTUAL_TRIP_STOPS[tripIndex];

  useEffect(() => {
    if (isVirtualTrip) {
      setZoom(currentLoc.zoom);
      setHeading(currentLoc.heading);
      setPitch(currentLoc.pitch);
      setViewMode('3D');
    }
  }, [tripIndex, isVirtualTrip]);

  useEffect(() => {
    let timer: any;
    if (isAutoPlay && isVirtualTrip) {
      timer = setTimeout(() => {
        if (tripIndex < VIRTUAL_TRIP_STOPS.length - 1) {
          setTripIndex(prev => prev + 1);
        } else {
          setIsAutoPlay(false);
        }
      }, 10000); // 10 secondes par étape
    }
    return () => clearTimeout(timer);
  }, [isAutoPlay, tripIndex, isVirtualTrip]);

  const stopCurrentAudio = () => {
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch(e) {}
      currentSourceRef.current = null;
    }
    setIsSpeaking(false);
  };

  const handleSpeakNarration = async () => {
    if (isSpeaking) {
      stopCurrentAudio();
      return;
    }
    setIsSpeaking(true);
    const voice = (localStorage.getItem('mohamed-ai-voice') as VoiceName) || 'Zephyr';
    const base64Audio = await generateSpeech(currentLoc.narration, voice);
    
    if (base64Audio) {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const ctx = audioContextRef.current;
      const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsSpeaking(false);
      currentSourceRef.current = source;
      source.start();
    } else {
      setIsSpeaking(false);
    }
  };

  if (!isOpen) return null;

  const mapType = (viewMode === 'SATELLITE' || viewMode === '3D') ? 'k' : 'm';
  const mapUrl = `https://maps.google.com/maps?q=${currentLoc.lat},${currentLoc.lng}&z=${zoom}&t=${mapType}&output=embed`;
  const earthUrl = `https://earth.google.com/web/search/${currentLoc.lat},${currentLoc.lng}`;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      
      <div className="relative w-full lg:w-[90%] h-full bg-slate-950 shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col border-l border-white/10 overflow-hidden">
        
        {/* Header de Contrôle */}
        <div className="h-20 shrink-0 px-8 flex items-center justify-between bg-slate-900/80 backdrop-blur-md border-b border-white/5 z-20">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <h2 className="text-[12px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full animate-pulse ${isVirtualTrip ? 'bg-orange-500 shadow-[0_0_10px_#f97316]' : 'bg-blue-500'}`}></span>
                {isVirtualTrip ? 'VOYAGE VIRTUEL' : 'EXPLORATION MAPS'}
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{currentLoc.name} — {currentLoc.country}</p>
            </div>

            <a 
              href={earthUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-emerald-500/30 group"
            >
              <span className="text-xl group-hover:scale-125 transition-transform">🌍</span>
              GOOGLE EARTH
            </a>

            {!isVirtualTrip && (
              <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10">
                {(['2D', 'SATELLITE', '3D'] as MapMode[]).map((mode) => (
                  <button 
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            {!isVirtualTrip ? (
              <button 
                onClick={() => { setIsVirtualTrip(true); setTripIndex(0); }}
                className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-orange-900/40 flex items-center gap-3 active:scale-95"
              >
                <span className="text-xl">✈️</span>
                LANCER LE VOYAGE VIRTUEL
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 ${isAutoPlay ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white/5 border-white/10 text-white'}`}
                >
                  {isAutoPlay ? 'AUTO-PLAY ACTIF' : 'LECTURE MANUELLE'}
                </button>
                <button 
                  onClick={() => { setIsVirtualTrip(false); stopCurrentAudio(); }}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                >
                  QUITTER LE VOYAGE
                </button>
              </div>
            )}

            <button onClick={onClose} className="p-3 bg-white/5 text-slate-400 hover:text-white hover:bg-red-500/20 rounded-2xl transition-all border border-white/10 group">
              <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row bg-black overflow-hidden relative">
          
          <div className="flex-1 relative bg-slate-900 shadow-inner">
            <iframe 
              key={`${viewMode}-${tripIndex}-${zoom}-${heading}`}
              src={mapUrl} 
              className="w-full h-full border-none filter brightness-90 contrast-110 saturate-110" 
              allowFullScreen 
              loading="lazy"
            ></iframe>

            {/* Overlay Cinématique de Voyage */}
            {isVirtualTrip && (
              <div className="absolute inset-0 pointer-events-none border-[20px] border-slate-950/20 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
            )}

            {/* Bulle de Narration de Mohamed */}
            {isVirtualTrip && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] lg:w-[800px] z-40 animate-in slide-in-from-bottom duration-1000">
                <div className="bg-slate-900/90 backdrop-blur-3xl p-10 rounded-[4rem] border-2 border-orange-500/30 shadow-[0_30px_100px_rgba(0,0,0,0.9)] relative">
                  
                  {/* Avatar de Mohamed Guide */}
                  <div className="absolute -top-12 left-12 w-24 h-24 rounded-full border-4 border-orange-600 overflow-hidden shadow-2xl z-50 bg-slate-900">
                    <img src={SAVANNA_AVATAR} alt="Guide Mohamed" className={`w-full h-full object-cover ${isSpeaking ? 'scale-110 animate-pulse' : ''}`} />
                  </div>

                  <div className="flex flex-col gap-6 pl-24 lg:pl-0 mt-4 lg:mt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <h4 className="text-[12px] font-black text-orange-500 uppercase tracking-[0.4em] flex items-center gap-3">
                          LE GUIDE MOHAMED EXPLIQUE
                          {isSpeaking && <span className="flex gap-1"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.2s]"></span></span>}
                        </h4>
                        <a 
                          href={earthUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-white tracking-widest uppercase hover:bg-emerald-600 transition-colors pointer-events-auto"
                        >
                          Lien Earth
                        </a>
                      </div>
                      <button 
                        onClick={handleSpeakNarration}
                        className={`p-3 rounded-2xl transition-all border-2 pointer-events-auto ${isSpeaking ? 'bg-orange-600 border-orange-400 text-white animate-pulse' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                      >
                        <span className="text-xl">{isSpeaking ? '⏸️' : '🔊'}</span>
                      </button>
                    </div>
                    
                    <p className="text-white font-black leading-tight text-xl lg:text-3xl tracking-tight italic">
                      "{currentLoc.narration}"
                    </p>
                    
                    <div className="flex items-center justify-between pt-8 border-t border-white/10 mt-2 pointer-events-auto">
                      <button 
                        disabled={tripIndex === 0}
                        onClick={() => { setTripIndex(prev => Math.max(0, prev - 1)); stopCurrentAudio(); }}
                        className={`px-10 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all ${tripIndex === 0 ? 'opacity-20 cursor-not-allowed text-slate-600' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}
                      >
                        PRÉCÉDENT
                      </button>
                      
                      <div className="flex items-center gap-3">
                        {VIRTUAL_TRIP_STOPS.map((_, i) => (
                          <button 
                            key={i} 
                            onClick={() => { setTripIndex(i); stopCurrentAudio(); }}
                            className={`h-2 transition-all rounded-full ${i === tripIndex ? 'w-12 bg-orange-500 shadow-[0_0_15px_#f97316]' : 'w-3 bg-white/20 hover:bg-white/40'}`} 
                          />
                        ))}
                      </div>

                      <button 
                        onClick={() => {
                          if (tripIndex < VIRTUAL_TRIP_STOPS.length - 1) {
                            setTripIndex(prev => prev + 1);
                            stopCurrentAudio();
                          } else {
                            setIsVirtualTrip(false);
                            onExploreTopic("C'était un voyage magnifique ! Mohamed, j'ai adoré l'expédition. Raconte-moi une dernière anecdote incroyable sur un des lieux que nous venons de voir.");
                            onClose();
                          }
                        }}
                        className="px-12 py-4 bg-orange-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-orange-500 transition-all shadow-2xl shadow-orange-900/40 active:scale-95"
                      >
                        {tripIndex === VIRTUAL_TRIP_STOPS.length - 1 ? 'TERMINER' : 'SUIVANT'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar de sélection des points (uniquement si pas en voyage) */}
          {!isVirtualTrip && (
            <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-white/5 overflow-y-auto custom-scrollbar p-8 space-y-8 shrink-0 z-20">
              <div className="flex flex-col gap-2">
                <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-500">POINTS D'INTÉRÊT</h3>
                <p className="text-[10px] text-slate-600 font-bold uppercase">Sélectionnez une destination</p>
              </div>
              
              <div className="space-y-4">
                {VIRTUAL_TRIP_STOPS.map((spot, idx) => (
                  <button
                    key={spot.name}
                    onClick={() => { setTripIndex(idx); }}
                    className={`w-full p-6 rounded-[2.5rem] flex items-center gap-6 transition-all text-left border-2 group relative overflow-hidden ${tripIndex === idx ? 'bg-blue-600/10 border-blue-600/50 shadow-2xl' : 'bg-black/20 border-white/5 hover:border-white/20'}`}
                  >
                    <span className={`text-4xl transition-transform duration-700 ${tripIndex === idx ? 'scale-125 rotate-12' : 'group-hover:scale-110'}`}>{spot.icon}</span>
                    <div className="flex flex-col flex-1">
                       <span className={`text-[13px] font-black uppercase tracking-tight leading-none mb-2 ${tripIndex === idx ? 'text-blue-400' : 'text-white'}`}>{spot.name}</span>
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{spot.country}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-8 border-t border-white/5">
                 <div className="p-8 bg-blue-600/5 rounded-[2.5rem] border border-blue-500/20 text-center">
                    <p className="text-[11px] text-blue-400 font-black uppercase tracking-widest mb-4">MODE EXPLORATEUR</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                      Walahi, chaque point sur cette carte est une porte vers une histoire millénaire. Quel trésor veux-tu voir ?
                    </p>
                    <a 
                      href={earthUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-emerald-500 shadow-lg"
                    >
                      Ouvrir dans Google Earth
                    </a>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapDiscovery;
