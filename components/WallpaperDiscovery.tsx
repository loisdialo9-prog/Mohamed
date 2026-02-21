
import React, { useState, useEffect } from 'react';

interface WallpaperDiscoveryProps {
  isOpen: boolean;
  onClose: () => void;
  currentWallpaper: string | null;
  onSelect: (url: string | null) => void;
}

const WALLPAPERS = [
  { id: 'none', name: 'Original', url: null, icon: '✨', region: 'Défaut' },
  { id: 'djenne', name: 'Djenné Sacrée', url: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=90&w=1200', icon: '🕌', region: 'Mali' },
  { id: 'savanna', name: 'Sérénité Savane', url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=90&w=1200', icon: '🐘', region: 'Afrique de l\'Est' },
  { id: 'chefchaouen', name: 'Perle Bleue', url: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=90&w=1200', icon: '🏙️', region: 'Maroc' },
  { id: 'victoria', name: 'Mosi-oa-Tunya', url: 'https://images.unsplash.com/photo-1535941339077-2dd5c72439ed?auto=format&fit=crop&q=90&w=1200', icon: '🌊', region: 'Zambie / Zimbabwe' },
  { id: 'lagos', name: 'Lagos Dynamic', url: 'https://images.unsplash.com/photo-1618841557871-b4664fbf0c5a?auto=format&fit=crop&q=90&w=1200', icon: '🚀', region: 'Nigéria' },
  { id: 'kilimandjaro', name: 'Kilimandjaro', url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=90&w=1200', icon: '🏔️', region: 'Tanzanie' },
  { id: 'sahara', name: 'Or du Sahara', url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&q=90&w=1200', icon: '🏜️', region: 'Sahel' },
  { id: 'lalibela', name: 'Cité de Pierre', url: 'https://images.unsplash.com/photo-1565551225575-802c639f7f45?auto=format&fit=crop&q=90&w=1200', icon: '⛪', region: 'Éthiopie' },
  { id: 'market', name: 'Marché Vibrant', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=90&w=1200', icon: '🧺', region: 'Afrique de l\'Ouest' },
  { id: 'tablemountain', name: 'Table Mountain', url: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?auto=format&fit=crop&q=90&w=1200', icon: '⛰️', region: 'Afrique du Sud' },
];

const SafeImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) setHasError(true);
    }, 12000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-900 ${className}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800 animate-pulse">
           <span className="text-2xl opacity-10">🖼️</span>
        </div>
      )}
      {!hasError ? (
        <img 
          src={src} 
          alt={alt} 
          crossOrigin="anonymous"
          className={`w-full h-full object-cover transition-all duration-1000 ${isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-rose-700 to-indigo-900 flex flex-col items-center justify-center p-4 text-center">
           <span className="text-3xl mb-1">🖼️</span>
           <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Aperçu indisponible</span>
        </div>
      )}
    </div>
  );
};

const WallpaperDiscovery: React.FC<WallpaperDiscoveryProps> = ({ isOpen, onClose, currentWallpaper, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full md:w-[450px] h-full bg-white dark:bg-slate-950 shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col border-l-8 border-rose-600">
        
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between mb-4">
             <span className="text-4xl">🎨</span>
             <button onClick={onClose} className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-2xl text-rose-600 hover:bg-rose-600 hover:text-white transition-all">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
          <h2 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter leading-none uppercase">AMBIANCE <br/><span className="text-rose-600">VISUELLE</span></h2>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3 italic">Personnalise ton espace de palabre.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <div className="grid grid-cols-1 gap-4">
            {WALLPAPERS.map((wp) => (
              <button
                key={wp.id}
                onClick={() => onSelect(wp.url)}
                className={`group relative h-36 rounded-[2.5rem] overflow-hidden border-4 transition-all active:scale-95 ${currentWallpaper === wp.url ? 'border-rose-600 shadow-[0_0_30px_rgba(225,29,72,0.3)]' : 'border-slate-100 dark:border-slate-800 hover:border-rose-300'}`}
              >
                {wp.url ? (
                  <SafeImage 
                    src={wp.url} 
                    alt={wp.name} 
                    className="w-full h-full group-hover:scale-110 transition-transform duration-1000"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="text-5xl">✨</span>
                  </div>
                )}
                
                {/* Overlay pour la lisibilité amélioré */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                <div className="absolute bottom-5 left-7 flex flex-col items-start text-left z-10">
                   <div className="flex items-center gap-2">
                     <span className="text-2xl group-hover:scale-125 transition-transform">{wp.icon}</span>
                     <span className="text-sm font-black text-white uppercase tracking-widest leading-none">{wp.name}</span>
                   </div>
                   <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest ml-8 mt-1">{wp.region}</span>
                </div>

                {currentWallpaper === wp.url && (
                  <div className="absolute top-5 right-7 bg-rose-600 text-white p-2 rounded-full shadow-lg z-20 animate-in zoom-in">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="h-4"></div>
        </div>
      </div>
    </div>
  );
};

export default WallpaperDiscovery;
