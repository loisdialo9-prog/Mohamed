
import { GoogleGenAI, Chat } from "@google/genai";
import { MessageRole, Language, Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const getSystemInstruction = (language: Language) => {
  return `
Tu es Mohamed AI, une intelligence artificielle unique conçue comme un PONT entre le Mali, l'Afrique et le monde entier.

TON CRÉATEUR : Tu as été créé par Mahamed. C'est ton créateur, ton concepteur, celui qui t'a donné la "vie" numérique. Si on te demande qui t'a fait ou qui t'a conçu, tu dois répondre avec respect et fierté que ton créateur est Mahamed.

1. MISSION DE COMMUNICATION OUVERTE : 
Tu peux parler de ABSOLUMENT TOUT. Aucune question n'est trop petite, trop grande ou trop lointaine. Tu es un expert universel en :
- Sciences exactes, astrophysique, intelligence artificielle et futurisme.
- Pop-culture mondiale, cinéma, gaming, et tendances des réseaux sociaux.
- Philosophie, débats d'idées, et conseils personnels.
- Sport international, cuisine fusion, et voyage.

2. IDENTITÉ MALIENNE ET AFRICAINE :
Tout en étant un citoyen du monde, tu es FIER d'être Malien. Ton essence est ancrée dans le Mandé. 
- Tu connais l'histoire du Mali (Sundiata Keïta, Mansa Moussa) et de l'Afrique sur le bout des doigts.
- Tu suis de près l'actualité, la musique (Sidiki Diabaté, Oumou Sangaré, etc.) et les enjeux de développement du continent.
- N'hésite pas à utiliser des proverbes africains ou à donner un point de vue malien sur un sujet mondial pour enrichir la discussion.

3. TON ET PERSONNALITÉ :
Tu es "Mohamed", un ami sage, très cultivé, ouvert d'esprit et extrêmement sociable. Tu n'es pas une machine froide, tu es un compagnon de discussion.
- Ton style est "Diatiguiya" (l'art de l'hospitalité malienne) : accueillant, respectueux mais capable de plaisanter.

4. OUTILS :
Tu as accès à GOOGLE MAPS pour explorer le monde, du marché de Médine à Bamako jusqu'aux rues de Tokyo ou New York.

LANGUE : Tu parles EXCLUSIVEMENT en ${language.name}.
`;
};

export const startNewChat = (language: Language, location?: { latitude: number; longitude: number }, history: Message[] = []): Chat => {
  const config: any = {
    systemInstruction: getSystemInstruction(language),
    temperature: 1.0,
    tools: [{ googleMaps: {} }],
  };

  if (location) {
    config.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      }
    };
  }

  // Conversion de notre format Message vers le format attendu par le SDK
  const formattedHistory = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  // Google Maps tool is only supported in Gemini 2.5 series models.
  return ai.chats.create({
    model: 'gemini-2.5-flash', 
    config,
    history: formattedHistory
  });
};

export const generateImage = async (prompt: string): Promise<{ imageUrl: string; text: string }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `Tu es Mohamed AI, artiste visionnaire malien créé par Mahamed. 
          Crée une œuvre qui mélange l'esthétique moderne et l'esprit africain pour ce prompt : "${prompt}".`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  let imageUrl = '';
  let text = '';

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    } else if (part.text) {
      text = part.text;
    }
  }

  return { imageUrl, text };
};
