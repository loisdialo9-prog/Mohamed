
import React, { useState, useRef, useMemo } from 'react';
import { Language, SUPPORTED_LANGUAGES, ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentLanguage: Language;
  onLanguageSelect: (lang: Language) => void;
  onSelectTopic: (topic: string) => void;
  chatWallpaper: string | null;
  onWallpaperSelect: (wallpaper: string | null) => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onOpenDiscovery: () => void;
  onOpenAfricaDiscovery: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  setIsOpen, 
  currentLanguage, 
  onLanguageSelect, 
  onSelectTopic,
  chatWallpaper,
  onWallpaperSelect,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onOpenDiscovery,
  onOpenAfricaDiscovery
}) => {
  const [historySearch, setHistorySearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestedWallpapers = [
    { id: 'none', label: 'Défaut', value: null, icon: '🚫' },
    { id: 'bogolan', label: 'Bogolan', value: 'https://images.unsplash.com/photo-1621503716719-f70346387a22?auto=format&fit=crop&q=80&w=800', icon: '🎨' },
    { id: 'savannah', label: 'Savane', value: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800', icon: '🦓' },
    { id: 'niger', label: 'Niger', value: 'https://images.unsplash.com/photo-1509015392842-8c76743b0704?auto=format&fit=crop&q=80&w=800', icon: '🚣' },
  ];

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => 
      s.title.toLowerCase().includes(historySearch.toLowerCase()) ||
      s.messages.some(m => m.text.toLowerCase().includes(historySearch.toLowerCase()))
    );
  }, [sessions, historySearch]);

  const groupedSessions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { [key: string]: ChatSession[] } = {
      "Aujourd'hui": [],
      "Hier": [],
      "Plus ancien": []
    };

    filteredSessions.forEach(s => {
      const d = new Date(s.lastModified);
      if (d >= today) groups["Aujourd'hui"].push(s);
      else if (d >= yesterday) groups["Hier"].push(s);
      else groups["Plus ancien"].push(s);
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [filteredSessions]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onWallpaperSelect(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full transition-colors duration-300">
          
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-xl font-bold heading-font">
               <span className="text-green-600">Mohamed</span> AI
            </span>
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            
            {/* BOUTON DÉCOUVERTE MALI */}
            <button 
              onClick={onOpenDiscovery}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white font-black flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all active:scale-95 border-b-4 border-amber-700 group"
            >
              <span className="text-2xl group-hover:animate-bounce">🇲🇱</span>
              <span className="uppercase tracking-widest text-xs">Découvrir le Mali</span>
            </button>

            {/* BOUTON DÉCOUVERTE AFRIQUE */}
            <button 
              onClick={onOpenAfricaDiscovery}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-br from-green-600 via-yellow-500 to-red-600 text-white font-black flex items-center justify-center gap-3 shadow-xl shadow-red-500/20 hover:scale-[1.02] transition-all active:scale-95 border-b-4 border-red-800 group"
            >
              <span className="text-2xl group-hover:animate-spin duration-1000">🌍</span>
              <span className="uppercase tracking-widest text-xs">L'Afrique en Couleurs</span>
            </button>

            {/* NEW CHAT BUTTON */}
            <button 
              onClick={onNewChat}
              className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Nouvelle Palabre
            </button>

            {/* HISTORY SEARCH */}
            <div className="px-1 pt-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Chercher une discussion..." 
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs font-bold focus:ring-2 focus:ring-green-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
                />
                <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>

            {/* HISTORY LIST */}
            <div className="space-y-4">
              {groupedSessions.length > 0 ? groupedSessions.map(([groupName, items]) => (
                <div key={groupName} className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 px-3 py-2">{groupName}</h4>
                  {items.map(s => (
                    <div key={s.id} className="group relative">
                      <button
                        onClick={() => { onSelectSession(s.id); setIsOpen(false); }}
                        className={`w-full text-left px-3 py-3 rounded-xl transition-all flex flex-col gap-0.5 ${currentSessionId === s.id ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        <span className={`text-xs font-bold truncate pr-6 ${currentSessionId === s.id ? 'text-green-700 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {s.title}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium italic">
                          {s.messages.length} messages • {s.languageCode.toUpperCase()}
                        </span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }}
                        className="absolute right-2 top-3 p-1.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all rounded-lg"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )) : (
                <div className="px-3 py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase italic tracking-widest">Aucune discussion trouvée</p>
                </div>
              )}
            </div>

            {/* LANGUAGES */}
            <div>
              <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 px-2 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-slate-300 dark:bg-slate-700"></span>
                Langues
              </h3>
              <div className="grid grid-cols-1 gap-1 px-1">
                {SUPPORTED_LANGUAGES.filter(l => l.isAfrican).slice(0, 5).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => onLanguageSelect(lang)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${currentLanguage.code === lang.code ? 'bg-green-600 text-white' : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750'}`}
                  >
                    <span className="flex items-center gap-2"><span>{lang.flag}</span> {lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* WALLPAPERS */}
            <div>
              <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 px-2 flex items-center gap-2">
                <span className="w-4 h-[1px] bg-slate-300 dark:bg-slate-700"></span>
                Fonds
              </h3>
              <div className="grid grid-cols-4 gap-2 px-1">
                {suggestedWallpapers.map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => onWallpaperSelect(wp.value)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${chatWallpaper === wp.value ? 'border-green-500' : 'border-transparent'}`}
                    title={wp.label}
                  >
                    {wp.value ? <img src={wp.value} className="w-full h-full object-cover" alt={wp.label} /> : <div className="w-full h-full flex items-center justify-center text-xs bg-slate-100 dark:bg-slate-800">{wp.icon}</div>}
                  </button>
                ))}
                <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-green-500">+</button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              </div>
            </div>

          </div>

          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-center">
             <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">🌍 Mohamed AI Historique</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
