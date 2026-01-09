
import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../types';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  languageName: string;
  wallpaper?: string | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  languageName,
  wallpaper 
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = 'none';
    const parent = e.currentTarget.parentElement;
    if (parent) {
      const errorMsg = document.createElement('div');
      errorMsg.className = "p-4 bg-red-50 dark:bg-red-900/20 text-red-500 text-xs rounded-xl border border-red-100 dark:border-red-900/30 flex flex-col items-center gap-2";
      errorMsg.innerHTML = `
        <svg class="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <span>L'image n'a pas pu être chargée. Hakɛto.</span>
      `;
      parent.appendChild(errorMsg);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100 dark:bg-slate-950 transition-colors duration-300 relative">
      
      {/* BACKGROUND WALLPAPER */}
      {wallpaper && (
        <div className="absolute inset-0 z-0 transition-all duration-700 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90 dark:opacity-70 scale-105"
            style={{ backgroundImage: `url(${wallpaper})` }}
          />
          <div className="absolute inset-0 bg-white/10 dark:bg-black/30 backdrop-brightness-95"></div>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth custom-scrollbar relative z-10">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] md:max-w-[75%] flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${message.role === 'user' ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm' : 'bg-green-600 text-white shadow-md'}
              `}>
                {message.role === 'user' ? 'U' : 'M'}
              </div>
              
              <div className={`
                px-4 py-3 rounded-2xl shadow-lg text-sm md:text-base leading-relaxed transition-all duration-300 flex flex-col gap-3
                ${message.role === 'user' 
                  ? 'bg-white/80 dark:bg-slate-800/85 backdrop-blur-xl text-slate-900 dark:text-slate-100 rounded-tr-none border border-white/20 dark:border-slate-700/50' 
                  : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 text-slate-900 dark:text-slate-100 rounded-tl-none border-l-4 border-l-green-600'}
              `}>
                {message.text && <div className="whitespace-pre-wrap font-semibold">{message.text}</div>}
                
                {/* Google Maps Interactive Cards */}
                {message.groundingChunks && message.groundingChunks.length > 0 && (
                  <div className="flex flex-col gap-2 mt-1">
                    {message.groundingChunks.map((chunk, idx) => chunk.maps && (
                      <a 
                        key={idx}
                        href={chunk.maps.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-green-500 transition-colors group shadow-sm"
                      >
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 shrink-0">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-black uppercase text-green-600 dark:text-green-500 mb-0.5 tracking-tighter">Lieu sur la Carte</p>
                          <p className="text-sm font-bold truncate text-slate-800 dark:text-slate-200">{chunk.maps.title}</p>
                        </div>
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {message.imageUrl && (
                  <div className="relative group min-h-[200px] flex items-center justify-center bg-black/5 rounded-xl overflow-hidden">
                    <img 
                      src={message.imageUrl} 
                      alt="Générée par Mohamed AI" 
                      className="rounded-xl w-full max-h-[500px] object-contain shadow-md transition-transform duration-500 hover:scale-[1.01]"
                      onError={handleImgError}
                    />
                    <a 
                      href={message.imageUrl} 
                      download={`mohamed-ai-${Date.now()}.png`}
                      className="absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-xs font-bold"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Enregistrer
                    </a>
                  </div>
                )}

                <div className={`text-[10px] mt-1 font-black tracking-tighter ${message.role === 'user' ? 'text-right opacity-60' : 'text-left opacity-60'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start relative z-10">
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xs animate-pulse shadow-md">
                M
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 px-4 py-2 rounded-2xl rounded-tl-none flex gap-1 items-center shadow-lg">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 md:p-6 bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-slate-200/50 dark:border-slate-800 transition-colors duration-300 relative z-20">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Écrivez à Mohamed AI... (ex: "Où est la Grande Mosquée de Bamako?")`}
            className="flex-1 bg-white/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-sm md:text-base pr-14 text-slate-900 dark:text-slate-100 font-bold placeholder-slate-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`
              absolute right-2 top-2 bottom-2 w-12 flex items-center justify-center rounded-xl transition-all
              ${!inputText.trim() || isLoading 
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-600 cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/20'}
            `}
          >
            <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
