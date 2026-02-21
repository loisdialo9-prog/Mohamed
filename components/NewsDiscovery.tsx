
import React, { useState, useEffect, useRef } from 'react';
import { fetchNewsFeed, fetchCurrentWeather } from '../services/gemini';

interface NewsDiscoveryProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreTopic: (topic: string) => void;
}

const FALLBACK_IMAGES: Record<string, string> = {
  'Mali': 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=1200',
  'Afrique': 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80&w=1200',
  'Monde': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
  'default': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200'
};

const NewsCard: React.FC<{ item: any; onClick: () => void }> = ({ item, onClick }) => {
  const [imgSrc, setImgSrc] = useState(item.imageUrl);
  const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  const handleError = () => {
    setImgStatus('error');
    const cat = item.category || 'default';
    setImgSrc(FALLBACK_IMAGES[cat] || FALLBACK_IMAGES['default']);
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-[#1f2023] rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-slate-200 dark:border-white/5 flex flex-col group h-full"
    >
      <div className="h-64 relative overflow-hidden bg-slate-200 dark:bg-slate-800">
        {imgStatus === 'loading' && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
        )}
        <img 
          src={imgSrc} 
          className={`w-full h-full object-cover transition-all duration-1000 ${imgStatus === 'loaded' ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`} 
          alt={item.title || "News Image"}
          onLoad={() => setImgStatus('loaded')}
          onError={handleError}
        />
        <div className="absolute top-4 left-4">
           <span className="px-3 py-1 bg-black/40 backdrop-blur-md text-[10px] font-black text-white rounded-full uppercase tracking-widest">{item.category || 'Info'}</span>
        </div>
      </div>
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-[11px] text-white font-black shadow-lg">{(item.source || 'M').charAt(0)}</div>
          <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{item.source || 'Source'} • {item.time || 'Live'}</span>
        </div>
        <h3 className="font-black text-slate-900 dark:text-white leading-tight mb-8 line-clamp-3 text-xl group-hover:text-blue-500 transition-colors">
          {item.title || "Titre de l'actualité"}
        </h3>
      </div>
    </div>
  );
};

const WeatherView: React.FC<{ weather: any; isLoading: boolean; onSearch: (loc: string) => void }> = ({ weather, isLoading, onSearch }) => {
  const [searchVal, setSearchVal] = useState('');
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) onSearch(searchVal);
  };
  const getConditionIcon = (cond: string | undefined) => {
    if (!cond) return '⛅';
    const c = cond.toLowerCase();
    if (c.includes('soleil') || c.includes('clear')) return '☀️';
    if (c.includes('pluie')) return '🌧️';
    return '⛅';
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom duration-700">
       <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex gap-4 bg-white dark:bg-[#1f2023] p-2 rounded-full shadow-xl border border-slate-200 dark:border-white/5">
          <input 
            type="text" 
            placeholder="Quartier ou ville..." 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="flex-1 bg-transparent px-6 py-3 outline-none font-black text-sm text-slate-900 dark:text-white"
          />
          <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95">Chercher</button>
       </form>

       {isLoading ? (
          <div className="h-96 flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
       ) : weather ? (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 text-[15rem] opacity-10 pointer-events-none">{getConditionIcon(weather.condition)}</div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                   <div>
                      <div className="flex items-center gap-3 mb-4">
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                         <span className="text-[12px] font-bold uppercase tracking-widest">{weather.neighborhood ? `${weather.neighborhood}, ` : ''}{weather.city}, {weather.country}</span>
                      </div>
                      <div className="flex items-baseline gap-4">
                         <span className="text-8xl md:text-[10rem] font-light tracking-tighter">{Math.round(weather.temp || 0)}</span>
                         <span className="text-4xl md:text-6xl font-bold">°C</span>
                      </div>
                      <p className="text-2xl md:text-3xl font-black mt-4 uppercase tracking-tight">{weather.condition || 'Météo'}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-6 bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10">
                      <div><p className="text-[10px] font-black uppercase tracking-widest opacity-60">Ressenti</p><p className="text-xl font-bold">{Math.round(weather.feelsLike || weather.temp || 0)}°C</p></div>
                      <div><p className="text-[10px] font-black uppercase tracking-widest opacity-60">Humidité</p><p className="text-xl font-bold">{weather.humidity || '45%'}</p></div>
                   </div>
                </div>
          </div>
       ) : null}
    </div>
  );
};

const NewsDiscovery: React.FC<NewsDiscoveryProps> = ({ isOpen, onClose, onExploreTopic }) => {
  const [news, setNews] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Découvrir');
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) loadData();
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    setIsWeatherLoading(true);
    
    // Chargement parallèle news + weather
    const [newsData, weatherData] = await Promise.all([
      fetchNewsFeed(),
      fetchCurrentWeather("Bamako, Mali")
    ]);

    setNews(newsData);
    setWeather(weatherData);
    setIsLoading(false);
    setIsWeatherLoading(false);
  };

  const handleManualWeather = async (loc: string) => {
    setIsWeatherLoading(true);
    const w = await fetchCurrentWeather(loc, true);
    if (w) setWeather(w);
    setIsWeatherLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center p-0 md:p-0 bg-black/90 backdrop-blur-xl overflow-hidden animate-in fade-in duration-500">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full h-full bg-[#f0f2f5] dark:bg-[#111214] flex flex-col overflow-hidden">
        
        <div className="h-16 px-4 md:px-12 flex items-center justify-between bg-white dark:bg-[#1f2023] border-b border-slate-200 dark:border-white/5 z-50">
          <div className="flex items-center gap-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-black italic shadow-lg">M</div>
            <div className="flex items-center gap-6 md:gap-10">
              {['Découvrir', 'Météo'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[13px] font-black transition-all relative py-5 uppercase tracking-tighter ${activeTab === tab ? 'text-blue-500' : 'text-slate-500'}`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-12 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto space-y-10">
             {activeTab === 'Découvrir' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {isLoading ? [1,2,3].map(i => <div key={i} className="h-80 bg-slate-200 dark:bg-white/5 rounded-[2.5rem] animate-pulse" />) :
                    news.map((item, i) => <NewsCard key={i} item={item} onClick={() => setSelectedArticle(item)} />)}
                </div>
             ) : (
                <WeatherView weather={weather} isLoading={isWeatherLoading} onSearch={handleManualWeather} />
             )}
          </div>
        </main>

        {selectedArticle && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 animate-in fade-in zoom-in duration-300">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => setSelectedArticle(null)} />
            <div className="relative w-full h-full bg-white dark:bg-[#111214] flex flex-col overflow-hidden">
               <div className="h-[40vh] relative overflow-hidden bg-slate-900">
                  <img src={selectedArticle.imageUrl} className="w-full h-full object-cover" alt="Art" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <button onClick={() => setSelectedArticle(null)} className="absolute top-10 right-10 p-4 bg-black/50 text-white rounded-3xl z-50"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" /></svg></button>
                  <div className="absolute bottom-12 left-12 right-12">
                     <span className="px-6 py-2 bg-blue-600 text-white text-[11px] font-black rounded-full uppercase mb-6 inline-block">{selectedArticle.category}</span>
                     <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter">{selectedArticle.title}</h2>
                  </div>
               </div>
               <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                  <div className="max-w-4xl mx-auto">
                    <article className="text-slate-800 dark:text-slate-200 text-xl md:text-2xl leading-relaxed font-medium">
                      {selectedArticle.full_report}
                    </article>
                    <button onClick={() => { onExploreTopic(`Approfondis : ${selectedArticle.title}`); setSelectedArticle(null); onClose(); }} className="mt-12 px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-sm shadow-2xl">En parler avec Mohamed</button>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsDiscovery;
