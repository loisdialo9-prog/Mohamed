
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Message, Language, SUPPORTED_LANGUAGES, ChatSession, VoiceName, GroundingChunk, Emotion, VoiceConfig } from './types';
import { startNewChat, generateImage, generateVideo } from './services/gemini';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import VoiceOverlay from './components/VoiceOverlay';
import MaliDiscovery from './components/MaliDiscovery';
import AfricaDiscovery from './components/AfricaDiscovery';
import TouristDiscovery from './components/TouristDiscovery';
import WallpaperDiscovery from './components/WallpaperDiscovery';
import ImageStudioDiscovery from './components/ImageStudioDiscovery';
import MapDiscovery from './components/MapDiscovery';
import IntroAnimation from './components/IntroAnimation';
import VoiceLab from './components/VoiceLab';
import NewsDiscovery from './components/NewsDiscovery';

export type VisualTheme = 'default' | 'sahara' | 'forest' | 'night';

const ParticleSystem = () => {
  const particles = useMemo(() => [...Array(25)].map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 10
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map(p => (
        <div 
          key={p.id}
          className="particle bg-theme-accent/20 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            bottom: '-20px',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => SUPPORTED_LANGUAGES.find(l => l.code === 'fr') || SUPPORTED_LANGUAGES[0]);
  
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>(() => {
    const saved = localStorage.getItem('mohamed-ai-voice-config');
    if (saved) return JSON.parse(saved);
    return { name: 'Zephyr', personality: 'un humain malien chaleureux et bienveillant' };
  });

  const [visualTheme, setVisualTheme] = useState<VisualTheme>(() => (localStorage.getItem('mohamed-ai-visual-theme') as VisualTheme) || 'default');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('mohamed-ai-theme') as 'light' | 'dark') || 'light');
  
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('mohamed-ai-sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((s: any) => ({
          ...s,
          lastModified: new Date(s.lastModified),
          messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
      } catch (e) { return []; }
    }
    return [];
  });
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isVoiceLabOpen, setIsVoiceLabOpen] = useState(false);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [isAfricaOpen, setIsAfricaOpen] = useState(false);
  const [isTouristOpen, setIsTouristOpen] = useState(false);
  const [isWallpaperOpen, setIsWallpaperOpen] = useState(false);
  const [isImageStudioOpen, setIsImageStudioOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [videoProgress, setVideoProgress] = useState<string | null>(null);
  const [translationTarget, setTranslationTarget] = useState<Language | null>(() => {
    const saved = localStorage.getItem('mohamed-ai-translation-target');
    return saved ? SUPPORTED_LANGUAGES.find(l => l.code === saved) || null : null;
  });
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>(undefined);
  const [chatWallpaper, setChatWallpaper] = useState<string | null>(localStorage.getItem('mohamed-ai-wallpaper'));
  
  const chatRef = useRef<any>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setUserLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
        () => console.log("Géo refusée")
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mohamed-ai-sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('mohamed-ai-voice-config', JSON.stringify(voiceConfig));
  }, [voiceConfig]);

  useEffect(() => {
    localStorage.setItem('mohamed-ai-theme', theme);
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('mohamed-ai-visual-theme', visualTheme);
    const root = document.documentElement;
    root.classList.remove('theme-sahara', 'theme-forest', 'theme-night');
    if (visualTheme !== 'default') root.classList.add(`theme-${visualTheme}`);
  }, [visualTheme]);

  useEffect(() => {
    if (currentSessionId) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) {
        chatRef.current = startNewChat(selectedLanguage, userLocation, session.messages);
      }
    } else if (sessions.length === 0) {
      createNewChat();
    }
  }, [currentSessionId, selectedLanguage, userLocation]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const isBM = selectedLanguage.code === 'bm';
    if (hour < 12) return isBM ? "[ÉMOTION: JOIE] I ni sogoma ! Mun bɛ n bɔlo i ye ?" : "[ÉMOTION: JOIE] I ni sogoma ! Salam, comment se passe ta matinée mon ami ?";
    if (hour < 18) return isBM ? "[ÉMOTION: JOIE] I ni tile ! N bɛ se k'i dɛmɛ cogo di ?" : "[ÉMOTION: JOIE] I ni tile ! Salam, j'espère que ta journée se passe bien. En quoi puis-je t'aider ?";
    return isBM ? "[ÉMOTION: SAGESSE] I ni wula ! Mun bɛ kɛ ?" : "[ÉMOTION: SAGESSE] I ni wula ! Bonsoir mon cher ami, comment puis-je te servir en ce moment ?";
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    const welcome = getGreeting();
    const emotionMatch = welcome.match(/\[ÉMOTION: (\w+)\]/);
    const emotion = (emotionMatch ? emotionMatch[1] : 'NEUTRE') as Emotion;
    const cleanText = welcome.replace(/\[ÉMOTION: \w+\]\s*/, '');

    const newSession: ChatSession = {
      id: newId,
      title: "Nouvelle discussion",
      messages: [{ id: 'w-' + newId, role: 'model', text: cleanText, emotion, timestamp: new Date() }],
      lastModified: new Date(),
      languageCode: selectedLanguage.code
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !currentSessionId) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, userMsg], lastModified: new Date() } : s));
    setIsLoading(true);
    
    try {
      const response = await chatRef.current.sendMessage({ message: text });
      
      // Gestion intelligente des Function Calls
      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const fc of response.functionCalls) {
          if (fc.name === 'generate_image') {
            const { prompt } = fc.args;
            setVideoProgress("Je prépare le dessin pour toi...");
            const res = await generateImage(prompt as string);
            const mMsg: Message = { 
              id: Date.now().toString(), 
              role: 'model', 
              text: res.text, 
              emotion: 'JOIE', 
              imageUrl: res.imageUrl, 
              timestamp: new Date() 
            };
            setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, mMsg] } : s));
          } else if (fc.name === 'generate_video') {
            const { prompt, aspectRatio } = fc.args;
            setVideoProgress("Prépare-toi, Mohamed sort sa caméra...");
            const url = await generateVideo(prompt as string, (aspectRatio as '16:9' | '9:16') || '16:9', setVideoProgress);
            const mMsg: Message = { 
              id: Date.now().toString(), 
              role: 'model', 
              text: "Walahi, voici le film que j'ai imaginé !", 
              emotion: 'JOIE', 
              videoUrl: url, 
              timestamp: new Date() 
            };
            setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, mMsg] } : s));
          }
        }
      } else {
        // Traitement du texte normal (ou streaming si nécessaire, mais ici on simplifie après l'appel réussi)
        const sText = response.text || '';
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        const emotionMatch = sText.match(/\[ÉMOTION: (\w+)\]/);
        const emotion = (emotionMatch ? emotionMatch[1] : 'NEUTRE') as Emotion;
        const cleanText = sText.replace(/\[ÉMOTION: \w+\]\s*/, '');

        const mMsg: Message = { 
          id: Date.now().toString(), 
          role: 'model', 
          text: cleanText, 
          emotion: emotion,
          timestamp: new Date(),
          groundingChunks: groundingChunks.length > 0 ? groundingChunks : undefined
        };
        
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, mMsg] } : s));
      }
    } catch (err) { 
      console.error(err); 
      // Fallback si l'erreur vient du modèle 2.5 flash tool calling
      handleSendMessageLegacy(text);
    } finally { 
      setIsLoading(false); 
      setVideoProgress(null); 
    }
  };

  // Legacy fallback pour assurer la continuité en cas de pépin avec Function Calling
  const handleSendMessageLegacy = async (text: string) => {
    const res = await chatRef.current.sendMessageStream({ message: text });
    const mId = Date.now().toString();
    let sText = '';
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, { id: mId, role: 'model', text: '', emotion: 'NEUTRE', timestamp: new Date() }] } : s));
    for await (const chunk of res) {
      sText += chunk.text || '';
      const emotionMatch = sText.match(/\[ÉMOTION: (\w+)\]/);
      const emotion = (emotionMatch ? emotionMatch[1] : 'NEUTRE') as Emotion;
      const cleanText = sText.replace(/\[ÉMOTION: \w+\]\s*/, '');
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { 
        ...s, 
        messages: s.messages.map(m => m.id === mId ? { ...m, text: cleanText, emotion } : m) 
      } : s));
    }
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <div className="relative h-screen w-full bg-theme-bg text-theme-text transition-colors duration-1000 bg-mesh-anim overflow-hidden">
      <ParticleSystem />
      {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
      <div className={`flex h-full w-full transition-opacity duration-1000 ${showIntro ? 'opacity-0' : 'opacity-100'}`}>
        {!isNewsOpen && (
          <Sidebar 
            isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} currentLanguage={selectedLanguage} onLanguageSelect={setSelectedLanguage}
            sessions={sessions} currentSessionId={currentSessionId} onSelectSession={setCurrentSessionId}
            onNewChat={createNewChat} onDeleteSession={(id) => setSessions(prev => prev.filter(s => s.id !== id))}
            onOpenDiscovery={() => setIsDiscoveryOpen(true)} onOpenAfricaDiscovery={() => setIsAfricaOpen(true)}
            onOpenTourist={() => setIsTouristOpen(true)} onOpenWallpaper={() => setIsWallpaperOpen(true)}
            onOpenImageStudio={() => setIsImageStudioOpen(true)} onOpenMap={() => setIsMapOpen(true)}
            onOpenNews={() => { setIsNewsOpen(true); setIsSidebarOpen(false); }}
            translationTarget={translationTarget} onSetTranslationTarget={setTranslationTarget}
            currentVisualTheme={visualTheme} onVisualThemeSelect={setVisualTheme}
            onSelectTopic={handleSendMessage} chatWallpaper={chatWallpaper} onWallpaperSelect={setChatWallpaper}
          />
        )}
        <main className="flex-1 flex flex-col overflow-hidden relative z-10">
          <header className="h-16 flex items-center justify-between px-6 bg-theme-surface/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
              <span className="font-black text-xl tracking-tighter group cursor-pointer">MOHAMED <span className="text-theme-primary group-hover:text-theme-accent transition-colors">AI</span></span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl hover:scale-110 active:rotate-45 transition-all">
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button onClick={() => setIsVoiceMode(true)} className="px-5 py-2.5 bg-theme-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:shadow-theme-primary/40 hover:-translate-y-0.5 transition-all active:scale-95">Appel</button>
            </div>
          </header>
          <ChatWindow 
            messages={currentSession?.messages || []} 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
            videoProgress={videoProgress} 
            languageName={selectedLanguage.name} 
            translationTarget={translationTarget} 
            wallpaper={chatWallpaper} 
            voiceConfig={voiceConfig}
          />
          {isVoiceMode && (
            <VoiceOverlay 
              isOpen={isVoiceMode} 
              onClose={() => setIsVoiceMode(false)} 
              language={selectedLanguage} 
              voiceConfig={voiceConfig} 
              onOpenVoiceLab={() => setIsVoiceLabOpen(true)}
            />
          )}
          <VoiceLab isOpen={isVoiceLabOpen} onClose={() => setIsVoiceLabOpen(false)} config={voiceConfig} onSave={setVoiceConfig} />
          <MaliDiscovery isOpen={isDiscoveryOpen} onClose={() => setIsDiscoveryOpen(false)} onExploreTopic={handleSendMessage} />
          <AfricaDiscovery isOpen={isAfricaOpen} onClose={() => setIsAfricaOpen(false)} onExploreTopic={handleSendMessage} />
          <TouristDiscovery isOpen={isTouristOpen} onClose={() => setIsTouristOpen(false)} onExploreTopic={handleSendMessage} />
          <WallpaperDiscovery isOpen={isWallpaperOpen} onClose={() => setIsWallpaperOpen(false)} currentWallpaper={chatWallpaper} onSelect={setChatWallpaper} />
          <ImageStudioDiscovery isOpen={isImageStudioOpen} onClose={() => setIsImageStudioOpen(false)} onAddImageToChat={handleSendMessage} />
          <MapDiscovery isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} onExploreTopic={handleSendMessage} />
          <NewsDiscovery isOpen={isNewsOpen} onClose={() => setIsNewsOpen(false)} onExploreTopic={handleSendMessage} />
        </main>
      </div>
    </div>
  );
};

export default App;
