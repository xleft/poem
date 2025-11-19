import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Poem, KeywordCard, PoetLetter, Language } from "../types";

// --- CONFIGURATION ---

// Helper function to safely access environment variables
// This prevents crashes if import.meta.env is undefined in certain environments
const getEnv = (key: string): string => {
  try {
    // Check Vite standard
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
    // Check Legacy/Node standard (fallback)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] || "";
    }
  } catch (e) {
    console.warn("Error accessing environment variable:", key, e);
  }
  return "";
};

const API_KEY = getEnv("VITE_API_KEY");
const BASE_URL = getEnv("VITE_API_BASE_URL") || "https://generativelanguage.googleapis.com";

// Debug logging to help verify configuration in browser console (safely masks key)
console.log("Gemini Service Init:", { 
  hasKey: !!API_KEY, 
  baseUrl: BASE_URL,
  keyLength: API_KEY ? API_KEY.length : 0
});

// Initialize Gemini Client
// We cast configuration to 'any' to avoid TypeScript errors if the SDK type definition 
// is stricter than the runtime support for 'baseUrl'.
const ai = new GoogleGenAI({ 
  apiKey: API_KEY,
  baseUrl: BASE_URL,
} as any);

const poemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    author: { type: Type.STRING },
    dynasty: { type: Type.STRING },
    content: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "The poem lines."
    },
    analysis: { type: Type.STRING, description: "Why this poem matches the user's feeling." },
    context: { type: Type.STRING, description: "Brief historical context of the poem." }
  },
  required: ["title", "author", "dynasty", "content", "analysis", "context"]
};

const cardsSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      term: { type: Type.STRING },
      category: { type: Type.STRING },
      description: { type: Type.STRING },
      culturalSignificance: { type: Type.STRING }
    },
    required: ["term", "category", "description", "culturalSignificance"]
  }
};

const letterSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    content: { type: Type.STRING, description: "The body of the letter from the poet." },
    poet: { type: Type.STRING },
    replyTo: { type: Type.STRING }
  },
  required: ["content", "poet", "replyTo"]
}

export const recommendPoem = async (userFeeling: string, language: Language): Promise<Poem> => {
  try {
    if (!API_KEY) throw new Error("API Key is missing. Please check VITE_API_KEY settings in Vercel.");

    let prompt = "";
    if (language === 'zh') {
        // Approx 1 in 5 chance for Song Lyric (Ci)
        const isSongCi = Math.random() < 0.2; 
        const typeRequest = isSongCi ? "Song Dynasty Lyric (Ci) (宋词)" : "Tang or Song Dynasty Poem (Shi) (唐诗/宋诗)";
        
        prompt = `The user feels: "${userFeeling}". Recommend a single ${typeRequest} that perfectly resonates with this feeling. 
        If it is a Ci (Lyric), ensure the lines are formatted correctly in the 'content' array.
        Return the poem in Traditional Chinese.`;
    } else {
        prompt = `The user feels: "${userFeeling}". Recommend a single classic Western poem (e.g., by Shakespeare, Keats, Wordsworth, Dickinson, Frost, Rilke, etc.) that perfectly resonates with this feeling. 
        For the 'dynasty' field, use the literary period (e.g., Romantic, Victorian, Modernist).
        Return the content in English.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: poemSchema,
        temperature: 1.0, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    const poem = JSON.parse(text) as Poem;
    poem.language = language;
    return poem;
  } catch (error) {
    console.error("Error recommending poem:", error);
    // Return specific error message for debugging if it's an auth error
    const errorMsg = (error as any).message || "";
    if (language === 'zh') {
        return {
            title: "出错啦",
            author: "系统",
            dynasty: "当今",
            content: ["网络连接异常", "请检查API配置", "或稍后再试"],
            analysis: errorMsg.includes("API Key") ? "未检测到API Key" : "AI暂时无法连接，请检查网络或额度。",
            context: "系统提示",
            language: 'zh'
        };
    } else {
        return {
            title: "Connection Error",
            author: "System",
            dynasty: "Modern",
            content: ["Network connection failed", "Please check API settings", "Or try again later"],
            analysis: errorMsg.includes("API Key") ? "API Key missing" : "Unable to connect to AI.",
            context: "System Alert",
            language: 'en'
        };
    }
  }
};

export const analyzePoemKeywords = async (poem: Poem, language: Language): Promise<KeywordCard[]> => {
  try {
    if (!API_KEY) return [];
    let prompt = "";
    let schema = cardsSchema;

    if (language === 'zh') {
        prompt = `You are an expert researcher in Chinese ancient poetry geography, phenology, and local customs. 
        Analyze the poem "${poem.title}" by ${poem.author}. 
        Extract 3-5 key terms specifically related to geography (地理), phenology/weather (物候), or local customs (风土).
        Ignore general emotions or people unless they represent a specific cultural custom.
        Ensure all fields are in Chinese.
        Categories must be strictly one of: "地理", "物候", "风土".`;
    } else {
        prompt = `You are an expert in Western literary analysis.
        Analyze the poem "${poem.title}" by ${poem.author}.
        Extract 3-5 key terms related to Setting, Imagery, or Symbolism.
        Categories must be strictly one of: "Setting", "Imagery", "Symbolism".
        Ensure all fields are in English.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as KeywordCard[];
  } catch (error) {
    console.error("Error analyzing keywords:", error);
    return [];
  }
};

export const generatePoetLetter = async (poem: Poem, userFeeling: string, language: Language): Promise<PoetLetter> => {
  try {
    if (!API_KEY) throw new Error("No API Key");
    let prompt = "";
    if (language === 'zh') {
        prompt = `You are the poet ${poem.author} from the ${poem.dynasty} dynasty.
        The user has come to you with this feeling: "${userFeeling}".
        You wrote the poem "${poem.title}" which resonates with this feeling.
        Write a personal letter to the user in Chinese.
        Adopt your historical persona fully. Mention your own life experiences.
        Tone: Intimate, like writing to an old friend across time.
        Keep it under 200 characters.`;
    } else {
        prompt = `You are the poet ${poem.author} (${poem.dynasty}).
        The user has come to you with this feeling: "${userFeeling}".
        You wrote the poem "${poem.title}".
        Write a personal letter to the user in English.
        Adopt your literary persona. Use language appropriate to your era (e.g., Shakespearean if Shakespeare, Romantic if Keats).
        Connect your life or philosophy to the user's feeling.
        Tone: Personal, insightful, timeless.
        Keep it under 150 words.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: letterSchema
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No response");
    const data = JSON.parse(text);
    
    return {
        content: data.content,
        poet: poem.author,
        replyTo: userFeeling
    };

  } catch (error) {
    console.error("Error generating letter", error);
    return {
        content: language === 'zh' ? "酒逢知己千杯少，话不投机半句多。今日微醺，暂且搁笔。" : "Words fail me today. Let the silence speak.",
        poet: poem.author,
        replyTo: userFeeling
    };
  }
};
