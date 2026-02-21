
import React, { useState } from 'react';
import { Language, SUPPORTED_LANGUAGES, ChatSession, VoiceName, VoiceConfig } from '../types';
import { VisualTheme } from '../App';

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
  onOpenTourist: () => void;
  onOpenWallpaper: () => void;
  onOpenImageStudio: () => void;
  onOpenMap: () => void;
  onOpenNews: () => void;
  translationTarget: Language | null;
  onSetTranslationTarget: (lang: Language | null) => void;
  currentVisualTheme: VisualTheme;
  onVisualThemeSelect: (theme: VisualTheme) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, setIsOpen, sessions, currentSessionId, onSelectSession, onNewChat,
  onDeleteSession, onOpenDiscovery, onOpenAfricaDiscovery, onOpenTourist, 
  onOpenWallpaper, onOpenImageStudio, onOpenMap, onOpenNews, translationTarget, onSetTranslationTarget 
}) => {
  const [showTransPicker, setShowTransPicker] = useState(false);

  // Configuration des "Barres d'Options" de Découverte
  const discoveryBars = [
    { label: 'Actualités', icon: '📡', color: 'from-sky-600 via-sky-500 to-cyan-400', shadow: 'shadow-sky-500/40', action: onOpenNews, desc: 'En Direct du Web', delay: '50ms' },
    { label: 'Mali', icon: '🇲🇱', color: 'from-orange-600 via-amber-500 to-yellow-400', shadow: 'shadow-orange-500/40', action: onOpenDiscovery, desc: 'Culture & Traditions', delay: '150ms' },
    { label: 'Afrique', icon: '🌍', color: 'from-emerald-600 via-green-500 to-lime-400', shadow: 'shadow-emerald-500/40', action: onOpenAfricaDiscovery, desc: 'Union & Futur', delay: '250ms' },
    { label: 'Exploration 3D', icon: '🗺️', color: 'from-blue-600 via-indigo-500 to-violet-500', shadow: 'shadow-blue-500/40', action: onOpenMap, desc: 'Voyage Immersif', delay: '350ms' },
    { label: 'Studio d\'Art', icon: '🖌️', color: 'from-rose-600 via-red-500 to-orange-400', shadow: 'shadow-red-500/40', action: onOpenImageStudio, desc: 'Générateur d\'Images', delay: '450ms' },
    { label: 'Guide Voyage', icon: '🧳', color: 'from-purple-600 via-fuchsia-500 to-pink-500', shadow: 'shadow-purple-500/40', action: onOpenTourist, desc: 'Itinéraires Experts', delay: '550ms' },
  ];

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />}
      
      <aside className={`fixed lg:static inset-y-0 left-0 w-80 bg-theme-surface border-r-2 border-slate-200 dark:border-slate-800 z-30 transform transition-all duration-500 ease-in-out ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="p-6 border-b-2 border-slate-100 dark:border-slate-800 flex justify-between items-center bg-theme-surface/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex flex-col">
              <span className="text-xl font-black text-theme-text tracking-tighter">
                MOHAMED <span className="text-theme-primary">AI</span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">L'Assistant du Mali</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-red-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar pb-10">
            
            {/* BARRE : NOUVELLE PALABRE */}
            <section className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Action</h4>
              <button 
                onClick={onNewChat} 
                className="w-full py-4 rounded-2xl bg-theme-primary text-white font-black flex items-center justify-center gap-3 shadow-xl shadow-theme-primary/20 uppercase tracking-widest text-[11px] hover:bg-theme-secondary hover:scale-[1.02] transition-all active:scale-95 group"
              >
                <div className="bg-white/20 p-1.5 rounded-lg group-hover:rotate-90 transition-transform">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                </div>
                Nouvelle palabre
              </button>
            </section>

            {/* BARRE : HISTORIQUE */}
            <section className="space-y-3">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 flex items-center justify-between">
                 <span>Historique des palabres</span>
                 <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-[9px]">{sessions.length}</span>
               </h4>
               <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                 {sessions.length === 0 ? (
                   <p className="text-[10px] text-slate-400 italic px-4 py-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-center">Aucune discussion mémorisée...</p>
                 ) : (
                   sessions.map((session) => (
                     <div 
                      key={session.id}
                      className={`group relative flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer border-2 ${currentSessionId === session.id ? 'bg-theme-primary/5 border-theme-primary/30 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent'}`}
                      onClick={() => { onSelectSession(session.id); if(window.innerWidth < 1024) setIsOpen(false); }}
                     >
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-md shrink-0 ${currentSessionId === session.id ? 'bg-theme-primary text-white shadow-lg shadow-theme-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-theme-primary'}`}>💬</div>
                       <div className="flex-1 min-w-0">
                         <h5 className={`text-[11px] font-black truncate ${currentSessionId === session.id ? 'text-theme-primary' : 'text-theme-text'}`}>{session.title}</h5>
                       </div>
                       <button 
                         onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                         className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all"
                       >
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       </button>
                     </div>
                   ))
                 )}
               </div>
            </section>

            {/* BARRES D'OPTIONS : DÉCOUVERTE */}
            <section className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 flex items-center gap-2">
                <span className="w-1 h-1 bg-theme-primary rounded-full"></span>
                Options de Découverte
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {discoveryBars.map((item) => (
                  <button 
                    key={item.label} 
                    onClick={() => { item.action(); if(window.innerWidth < 1024) setIsOpen(false); }} 
                    style={{ animationDelay: item.delay }}
                    className={`group relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br ${item.color} text-white text-left transition-all hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-2xl ${item.shadow} animate-in slide-in-from-left duration-700 fill-mode-both border border-white/10`}
                  >
                    {/* Glass Overlay */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="bg-white/20 w-12 h-12 flex items-center justify-center rounded-xl backdrop-blur-md shadow-inner group-hover:rotate-6 transition-transform">
                        <span className="text-2xl block icon-float">{item.icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[12px] font-black uppercase tracking-[0.1em]">{item.label}</span>
                        <span className="text-[9px] font-bold opacity-70 group-hover:opacity-100 transition-opacity">{item.desc}</span>
                      </div>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* BARRE : TRADUCTEUR RAPIDE */}
            <section className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
               <div className="flex items-center justify-between px-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Traducteur</h4>
                <button 
                  onClick={() => onSetTranslationTarget(translationTarget ? null : SUPPORTED_LANGUAGES.find(l => l.code === 'fr') || SUPPORTED_LANGUAGES[0])}
                  className={`w-10 h-5 rounded-full transition-all relative ${translationTarget ? 'bg-theme-primary shadow-sm' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${translationTarget ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>
              
              {translationTarget && (
                <div className="relative px-1">
                  <button onClick={() => setShowTransPicker(!showTransPicker)} className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border-2 border-theme-primary/20 rounded-xl hover:border-theme-primary transition-all group">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0">{translationTarget.flag}</span>
                      <span className="text-[11px] font-bold text-theme-text truncate">{translationTarget.name}</span>
                    </div>
                    <svg className={`w-4 h-4 text-theme-primary transition-transform shrink-0 ${showTransPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {showTransPicker && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 z-40 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-2 animate-in zoom-in duration-200">
                      <div className="max-h-[200px] overflow-y-auto custom-scrollbar space-y-1">
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => { onSetTranslationTarget(lang); setShowTransPicker(false); }}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all ${translationTarget?.code === lang.code ? 'bg-theme-primary text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-theme-text'}`}
                          >
                            <span className="text-lg">{lang.flag}</span>
                            <span className="text-[10px] font-bold truncate">{lang.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Footer Sidebar */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-theme-surface/80 flex flex-col items-center gap-1">
            <p className="text-[9px] font-black text-theme-primary uppercase tracking-widest">Créé par Mohamed Coulibaly</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Version 3.5 — Infos Live Edition</p>
          </div>
        </div>
      </aside>

      <style>{`
        .icon-float { animation: icon-float 3s ease-in-out infinite; }
        @keyframes icon-float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-4px) rotate(8deg); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
      `}</style>
    </>
  );
};
export default Sidebar;
