
import { GoogleGenAI, Chat, Modality, Type, FunctionDeclaration } from "@google/genai";
import { MessageRole, Language, Message, VoiceName, Emotion, VoiceConfig } from "../types";

const CACHE_KEY_NEWS = 'mohamed_ai_news_cache';
const CACHE_KEY_WEATHER = 'mohamed_ai_weather_cache';
const CACHE_KEY_COOLDOWN = 'mohamed_ai_api_cooldown';
const CACHE_TTL_NEWS = 120 * 60 * 1000; 
const CACHE_TTL_WEATHER = 60 * 60 * 1000;

// --- BASE DE DONNÉES LOCALE (FALLBACK) ---
const STATIC_NEWS_FALLBACK = [
  {
    title: "Mali : Vers une souveraineté énergétique renforcée avec de nouveaux parcs solaires",
    full_report: "Le gouvernement malien a annoncé le lancement de trois nouveaux projets de centrales solaires dans les régions de Ségou et Sikasso. Cette initiative vise à réduire la dépendance aux énergies fossiles et à stabiliser le réseau national pendant la période de forte chaleur.",
    source: "Mali Hebdo",
    time: "2h",
    category: "Mali",
    imageUrl: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Économie : La ZLECAF booste le commerce entre le Mali et ses voisins de l'AES",
    full_report: "Les échanges commerciaux au sein de l'Alliance des États du Sahel (AES) connaissent une croissance sans précédent. Les experts soulignent que la simplification des procédures douanières favorise l'exportation des produits locaux comme le coton et l'or.",
    source: "Afrique Éco",
    time: "4h",
    category: "Afrique",
    imageUrl: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Culture : Le Bogolan malien s'invite sur les podiums de la mode à Paris",
    full_report: "Plusieurs designers de renommée internationale ont intégré le Bogolan traditionnel malien dans leurs dernières collections. Cette reconnaissance mondiale offre une nouvelle visibilité aux artisans de San et de Bamako.",
    source: "Culture Mag",
    time: "6h",
    category: "Mali",
    imageUrl: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Tech : Bamako devient un hub croissant pour les startups de l'IA en Afrique de l'Ouest",
    full_report: "De plus en plus de jeunes entrepreneurs maliens lancent des solutions basées sur l'intelligence artificielle pour résoudre des problèmes agricoles et de santé. Le pôle technologique de la capitale attire désormais des investisseurs panafricains.",
    source: "Tech Afrique",
    time: "1j",
    category: "Afrique",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200"
  }
];

const STATIC_WEATHER_FALLBACK = {
  neighborhood: "ACI 2000",
  city: "Bamako",
  country: "Mali",
  temp: 34,
  feelsLike: 37,
  humidity: "20%",
  wind: "15 km/h",
  condition: "Ensoleillé",
  isDay: true,
  forecast: [
    { day: "Demain", temp: 35, condition: "Soleil" },
    { day: "Après-demain", temp: 33, condition: "Partiellement nuageux" }
  ]
};

const fetchLocks: Record<string, boolean> = {};

const extractJson = (text: string) => {
  try {
    const match = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return JSON.parse(text);
  } catch (e) { return null; }
};

function isQuotaError(error: any): boolean {
  const msg = JSON.stringify(error).toLowerCase();
  return msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota');
}

async function callApiWithRetry(fn: () => Promise<any>, retries = 0, delay = 1000): Promise<any> {
  const cooldown = localStorage.getItem(CACHE_KEY_COOLDOWN);
  if (cooldown && Date.now() < parseInt(cooldown)) throw new Error("QUOTA_COOLDOWN_ACTIVE");

  try {
    return await fn();
  } catch (error: any) {
    if (isQuotaError(error)) {
      localStorage.setItem(CACHE_KEY_COOLDOWN, (Date.now() + 60000).toString());
      throw new Error("RESOURCE_EXHAUSTED");
    }
    throw error;
  }
}

// startNewChat updated to include toolConfig for Google Maps grounding where relevant.
export const startNewChat = (
  language: Language, 
  location?: { latitude: number; longitude: number }, 
  history: Message[] = []
): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-2.5-flash'; 
  return ai.chats.create({ 
    model: modelName, 
    config: { 
      systemInstruction: `Tu es Mohamed AI, assistant malien. Langue: ${language.name}.`,
      temperature: 0.8,
      tools: [{ googleSearch: {} }, { googleMaps: {} }],
      ...(location ? {
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          }
        }
      } : {})
    }, 
    history: history.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] })) 
  });
};

// fetchNewsFeed updated to use gemini-3-flash-preview for basic text tasks.
export const fetchNewsFeed = async (forceRefresh = false): Promise<any[]> => {
  const cachedStr = localStorage.getItem(CACHE_KEY_NEWS);
  if (!forceRefresh && cachedStr) {
    const { data, timestamp } = JSON.parse(cachedStr);
    if (Date.now() - timestamp < CACHE_TTL_NEWS) return data;
  }

  if (fetchLocks['news']) return cachedStr ? JSON.parse(cachedStr).data : STATIC_NEWS_FALLBACK;
  fetchLocks['news'] = true;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await callApiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Actualités Mali/Afrique JSON: [{title,full_report,source,time,imageUrl,category}].`,
      config: { tools: [{ googleSearch: {} }] }
    }));

    const data = extractJson(response.text);
    if (Array.isArray(data) && data.length > 0) {
      localStorage.setItem(CACHE_KEY_NEWS, JSON.stringify({ data, timestamp: Date.now() }));
      return data;
    }
  } catch (err) {
    console.warn("News API failed, using fallback.");
  } finally {
    delete fetchLocks['news'];
  }
  return STATIC_NEWS_FALLBACK;
};

// fetchCurrentWeather updated to use gemini-3-flash-preview for basic text tasks.
export const fetchCurrentWeather = async (location: string | { lat: number; lng: number }, forceRefresh = false): Promise<any> => {
  const locationQuery = typeof location === 'string' ? location : `${location.lat},${location.lng}`;
  const cacheKey = `${CACHE_KEY_WEATHER}_${locationQuery.replace(/\s/g, '_')}`;
  const cachedStr = localStorage.getItem(cacheKey);

  if (!forceRefresh && cachedStr) {
    const { data, timestamp } = JSON.parse(cachedStr);
    if (Date.now() - timestamp < CACHE_TTL_WEATHER) return data;
  }

  if (fetchLocks[cacheKey]) return cachedStr ? JSON.parse(cachedStr).data : STATIC_WEATHER_FALLBACK;
  fetchLocks[cacheKey] = true;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await callApiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Météo JSON pour ${locationQuery}: {neighborhood,city,country,temp,condition,feelsLike,humidity,wind}.`,
      config: { tools: [{ googleSearch: {} }] }
    }));
    
    const data = extractJson(response.text);
    if (data) {
      localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
      return data;
    }
  } catch (error) {
    console.warn("Weather API failed, using fallback.");
  } finally {
    delete fetchLocks[cacheKey];
  }
  return STATIC_WEATHER_FALLBACK;
};

// Fixed generateImage signature to support isPro flag for high-quality model selection.
export const generateImage = async (prompt: string, isPro: boolean = false): Promise<{ imageUrl: string; text: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [{ text: prompt }] },
      config: { 
        imageConfig: { 
          aspectRatio: "1:1",
          ...(isPro ? { imageSize: "1K" } : {})
        } 
      }
    });
    let imageUrl = '';
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }
    return { imageUrl, text: "Voici l'image." };
  } catch (e) { return { imageUrl: '', text: "Erreur." }; }
};

// Fixed generateVideo signature to support onProgress callback from components.
export const generateVideo = async (
  prompt: string, 
  aspectRatio: '16:9' | '9:16' = '16:9',
  onProgress?: (status: string) => void
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  if (onProgress) onProgress("Préparation de la pellicule...");
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio }
  });
  while (!operation.done) {
    if (onProgress) onProgress("Mohamed est en train de monter votre film...");
    await new Promise(r => setTimeout(r, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const videoBlob = await videoResponse.blob();
  return URL.createObjectURL(videoBlob);
};

// Fixed generateSpeech signature to support personality and emotion parameters.
export const generateSpeech = async (
  text: string, 
  voice: VoiceName = 'Zephyr', 
  emotion?: Emotion, 
  personality?: string
): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    // Incorporate personality and emotion into the prompt for better TTS results
    const voicePrompt = `Personality: ${personality || 'standard'}. Emotion: ${emotion || 'NEUTRE'}. Text: ${text}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: voicePrompt }] }],
      config: {
        responseModalalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (e) { return undefined; }
};
