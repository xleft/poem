
import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { Poem, KeywordCard, PoetLetter } from "../types";

// Initialize Gemini Client
// Note: process.env.API_KEY is injected by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const poemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    author: { type: Type.STRING },
    dynasty: { type: Type.STRING },
    content: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "The poem lines. Keep original traditional Chinese characters."
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
      term: { type: Type.STRING, description: "The keyword from the poem (e.g., 明月, 长安)." },
      category: { type: Type.STRING, enum: ["地理", "物候", "风土"] },
      description: { type: Type.STRING, description: "Literal meaning in the context of the poem. (In Chinese)" },
      culturalSignificance: { type: Type.STRING, description: "Symbolic meaning in Chinese culture. (In Chinese)" }
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

export const recommendPoem = async (userFeeling: string): Promise<Poem> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `The user feels: "${userFeeling}". Recommend a single Tang or Song dynasty poem that perfectly resonates with this feeling. Return the poem in Traditional Chinese.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: poemSchema,
        temperature: 1.0, // Higher temperature for more creative matching
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as Poem;
  } catch (error) {
    console.error("Error recommending poem:", error);
    // Fallback matching failure
    return {
      title: "静夜思",
      author: "李白",
      dynasty: "唐",
      content: ["床前明月光", "疑是地上霜", "举头望明月", "低头思故乡"],
      analysis: "AI暂时无法连接，请稍后再试。",
      context: "游子思乡之作。"
    };
  }
};

export const analyzePoemKeywords = async (poem: Poem): Promise<KeywordCard[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert researcher in Chinese ancient poetry geography, phenology, and local customs. 
      Analyze the poem "${poem.title}" by ${poem.author}. 
      Extract 3-5 key terms specifically related to geography (地理), phenology/weather (物候), or local customs (风土).
      Ignore general emotions or people unless they represent a specific cultural custom.
      Ensure all fields are in Chinese.
      Categories must be strictly one of: "地理", "物候", "风土".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: cardsSchema
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

export const generatePoetLetter = async (poem: Poem, userFeeling: string): Promise<PoetLetter> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are the poet ${poem.author} from the ${poem.dynasty} dynasty.
      The user has come to you with this feeling: "${userFeeling}".
      You wrote the poem "${poem.title}" which resonates with this feeling.
      
      Write a personal letter to the user.
      1. Adopt your historical persona fully (e.g., Li Bai is romantic/bold, Du Fu is melancholy/caring, Su Shi is open-minded/philosophical).
      2. Mention your own life experiences that relate to the user's feeling.
      3. Explain why you wrote this poem or offer wisdom based on your life.
      4. The tone should be intimate, like writing to an old friend across time.
      5. Do NOT use modern salutations like "Dear user". Start directly or use an ancient address.
      6. Keep it under 200 Chinese characters.
      7. Output purely in Chinese.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: letterSchema
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No response");
    const data = JSON.parse(text);
    
    // Ensure the object matches the interface structure exactly
    return {
        content: data.content,
        poet: poem.author,
        replyTo: userFeeling
    };

  } catch (error) {
    console.error("Error generating letter", error);
    return {
        content: "酒逢知己千杯少，话不投机半句多。今日微醺，暂且搁笔。",
        poet: poem.author,
        replyTo: userFeeling
    };
  }
};
