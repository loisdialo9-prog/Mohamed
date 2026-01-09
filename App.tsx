
import React, { useState, useEffect, useRef } from 'react';
import { Message, Language, SUPPORTED_LANGUAGES, ChatSession } from './types';
import { startNewChat, generateImage } from './services/gemini';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import VoiceOverlay from './components/VoiceOverlay';
import MaliDiscovery from './components/MaliDiscovery';
import AfricaDiscovery from './components/AfricaDiscovery';

const App: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(SUPPORTED_LANGUAGES.find(l => l.code === 'fr')!);
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
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [isAfricaOpen, setIsAfricaOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>(undefined);
  const [chatWallpaper, setChatWallpaper] = useState<string | null>(() => {
    return localStorage.getItem('mohamed-ai-wallpaper') || null;
  });
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mohamed-ai-theme');
      return (saved as 'light' | 'dark') || 'light';
    }
    return 'light';
  });
  
  const chatRef = useRef<any>(null);

  // Get current messages
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  // Initialize location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        (error) => console.log("Localisation refusée:", error)
      );
    }
  }, []);

  // Persist sessions
  useEffect(() => {
    localStorage.setItem('mohamed-ai-sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Theme effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('mohamed-ai-theme', theme);
  }, [theme]);

  // Handle language/session change
  useEffect(() => {
    if (currentSessionId) {
      const session = sessions.find(s => s.id === currentSessionId);
      if (session) {
        chatRef.current = startNewChat(selectedLanguage, userLocation, session.messages);
      }
    } else {
      createNewChat();
    }
  }, [currentSessionId, selectedLanguage, userLocation]);

  const createNewChat = () => {
    const newId = Date.now().toString();
    const welcomeMessages: Record<string, string> = {
      'fr': "Salut ! Je suis Mohamed AI, créé par Mahamed. Je connais le monde entier, mais mon cœur bat pour le Mali et l'Afrique. De quoi veux-tu discuter ?",
      'bm': "I ni ce ! Mohamed b'i fɛ, Mahamed de ye n dila. N bɛ dunya dɔn, nka n k’u bɛ Mali ni Afiriki de la. An bɛ se ka baro kɛ fɛn o fɛn kan.",
      'en': "Hi! I'm Mohamed AI, created by Mahamed. I know the whole world, but my heart beats for Mali and Africa. What do you want to chat about?",
    };

    const welcomeText = welcomeMessages[selectedLanguage.code] || `Bonjour ! Je suis Mohamed AI, créé par Mahamed. Discutons du Mali, de l'Afrique ou du reste du vaste monde.`;

    const newSession: ChatSession = {
      id: newId,
      title: "Nouvelle discussion",
      messages: [{
        id: 'welcome-' + newId,
        role: 'model',
        text: welcomeText,
        timestamp: new Date()
      }],
      lastModified: new Date(),
      languageCode: selectedLanguage.code
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setIsSidebarOpen(false);
  };

  const deleteSession = (id: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (currentSessionId === id) {
        if (filtered.length > 0) setCurrentSessionId(filtered[0].id);
        else setCurrentSessionId(null);
      }
      return filtered;
    });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !currentSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date()
    };

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const isFirstUserMsg = s.messages.filter(m => m.role === 'user').length === 0;
        const newTitle = isFirstUserMsg ? (text.length > 30 ? text.substring(0, 30) + '...' : text) : s.title;
        return { 
          ...s, 
          messages: [...s.messages, userMessage], 
          lastModified: new Date(),
          title: newTitle
        };
      }
      return s;
    }));

    setIsLoading(true);

    try {
      const isImageRequest = (t: string) => {
        const input = t.toLowerCase();
        return ['image', 'photo', 'dessine', 'génère', 'crée', 'ja dila'].some(k => input.includes(k));
      };

      if (isImageRequest(text)) {
        const response = await generateImage(text);
        const modelMsg: Message = {
          id: (Date.now() + 5).toString(),
          role: 'model',
          text: response.text || "Voici une création pour vous.",
          imageUrl: response.imageUrl,
          timestamp: new Date()
        };
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, modelMsg] } : s));
      } else {
        const chat = chatRef.current;
        const result = await chat.sendMessageStream({ message: text });
        
        const modelMessageId = (Date.now() + 1).toString();
        let streamText = '';
        let groundingChunks: any[] = [];

        setSessions(prev => prev.map(s => s.id === currentSessionId ? { 
          ...s, 
          messages: [...s.messages, { id: modelMessageId, role: 'model', text: '', timestamp: new Date() }] 
        } : s));

        for await (const chunk of result) {
          streamText += chunk.text || '';
          if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            groundingChunks = chunk.candidates[0].groundingMetadata.groundingChunks;
          }
          setSessions(prev => prev.map(s => s.id === currentSessionId ? {
            ...s,
            messages: s.messages.map(m => m.id === modelMessageId ? { ...m, text: streamText, groundingChunks } : m)
          } : s));
        }
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: "Désolé, j'ai rencontré un souci. Hakɛto.",
        timestamp: new Date()
      };
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        currentLanguage={selectedLanguage}
        onLanguageSelect={setSelectedLanguage}
        onSelectTopic={handleSendMessage}
        chatWallpaper={chatWallpaper}
        onWallpaperSelect={setChatWallpaper}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={createNewChat}
        onDeleteSession={deleteSession}
        onOpenDiscovery={() => setIsDiscoveryOpen(true)}
        onOpenAfricaDiscovery={() => setIsAfricaOpen(true)}
      />

      <main className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden">
              <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">M</div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold heading-font leading-tight">Mohamed AI</h1>
              <p className="text-[10px] text-green-600 dark:text-green-500 font-bold uppercase tracking-widest">Créé par Mahamed • {currentSession?.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {theme === 'light' ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>}
            </button>
            <button onClick={() => setIsVoiceMode(true)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-all shadow-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="hidden xs:inline uppercase tracking-widest">Appel Vocal</span>
            </button>
          </div>
        </header>

        <ChatWindow 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
          languageName={selectedLanguage.name}
          wallpaper={chatWallpaper}
        />

        <VoiceOverlay 
          isOpen={isVoiceMode} 
          onClose={() => setIsVoiceMode(false)} 
          language={selectedLanguage}
        />

        <MaliDiscovery 
          isOpen={isDiscoveryOpen} 
          onClose={() => setIsDiscoveryOpen(false)} 
          onExploreTopic={handleSendMessage}
        />

        <AfricaDiscovery 
          isOpen={isAfricaOpen} 
          onClose={() => setIsAfricaOpen(false)} 
          onExploreTopic={handleSendMessage}
        />
      </main>
    </div>
  );
};

export default App;
