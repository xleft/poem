import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Poem, KeywordCard, PoetLetter, Language } from "../types";

// Initialize Gemini Client
// We use 'as any' to bypass TypeScript checking for baseUrl if the SDK definition is outdated,
// ensuring we can connect to the third-party proxy.
const ai = new GoogleGenAI({ 
  apiKey: process.env.API_KEY,
  baseUrl: process.env.VITE_API_BASE_URL
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
    if (language === 'zh') {
        return {
            title: "静夜思",
            author: "李白",
            dynasty: "唐",
            content: ["床前明月光", "疑是地上霜", "举头望明月", "低头思故乡"],
            analysis: "AI暂时无法连接，请稍后再试。",
            context: "游子思乡之作。",
            language: 'zh'
        };
    } else {
        return {
            title: "The Road Not Taken",
            author: "Robert Frost",
            dynasty: "Modernist",
            content: ["Two roads diverged in a yellow wood,", "And sorry I could not travel both", "And be one traveler, long I stood", "And looked down one as far as I could"],
            analysis: "Unable to connect to AI. Please try again later.",
            context: "A classic poem about choices.",
            language: 'en'
        };
    }
  }
};

export const analyzePoemKeywords = async (poem: Poem, language: Language): Promise<KeywordCard[]> => {
  try {
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