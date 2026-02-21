
export type MessageRole = 'user' | 'model';

// VoiceName est maintenant une string pour permettre des noms personnalisés si l'API évolue
export type VoiceName = string;

export type Emotion = 'SAGESSE' | 'JOIE' | 'FIERTÉ' | 'EMPATHIE' | 'ÉNERGIE' | 'NEUTRE';

export interface VoiceConfig {
  name: VoiceName;
  personality: string; // Description de l'aura vocale (ex: "Vieil homme sage", "Jeune dynamique")
}

export interface GroundingChunk {
  maps?: {
    uri: string;
    title: string;
  };
  web?: {
    uri: string;
    title: string;
  };
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  emotion?: Emotion;
  translation?: string;
  imageUrl?: string;
  videoUrl?: string;
  timestamp: Date;
  groundingChunks?: GroundingChunk[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastModified: Date;
  languageCode: string;
}

export interface Language {
  name: string;
  code: string;
  flag: string;
  isAfrican: boolean;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  // Afrique
  { name: 'Bambara', code: 'bm', flag: '🇲🇱', isAfrican: true },
  { name: 'Wolof', code: 'wo', flag: '🇸🇳', isAfrican: true },
  { name: 'Yoruba', code: 'yo', flag: '🇳🇬', isAfrican: true },
  { name: 'Swahili', code: 'sw', flag: '🇰🇪', isAfrican: true },
  { name: 'Hausa', code: 'ha', flag: '🇳🇪', isAfrican: true },
  { name: 'Lingala', code: 'ln', flag: '🇨🇩', isAfrican: true },
  { name: 'Zulu', code: 'zu', flag: '🇿🇦', isAfrican: true },
  { name: 'Amharique', code: 'am', flag: '🇪🇹', isAfrican: true },
  { name: 'Arabe (Maghreb)', code: 'ar-af', flag: '🇩🇿', isAfrican: true },
  
  // Monde
  { name: 'Français', code: 'fr', flag: '🇫🇷', isAfrican: false },
  { name: 'Anglais', code: 'en', flag: '🇺🇸', isAfrican: false },
  { name: 'Espagnol', code: 'es', flag: '🇪🇸', isAfrican: false },
  { name: 'Chinois', code: 'zh', flag: '🇨🇳', isAfrican: false },
  { name: 'Portugais', code: 'pt', flag: '🇵🇹', isAfrican: false },
  { name: 'Allemand', code: 'de', flag: '🇩🇪', isAfrican: false },
  { name: 'Russe', code: 'ru', flag: '🇷🇺', isAfrican: false },
  { name: 'Japonais', code: 'ja', flag: '🇯🇵', isAfrican: false },
  { name: 'Italien', code: 'it', flag: '🇮🇹', isAfrican: false },
];
