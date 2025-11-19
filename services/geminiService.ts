
import { Poem, KeywordCard, PoetLetter, Language } from "../types";

// --- CONFIGURATION ---
const getEnv = (key: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {
    console.warn("Error accessing environment variable:", key, e);
  }
  return "";
};

const API_KEY = getEnv("VITE_API_KEY");
// Use the base domain provided by the user
const RAW_BASE_URL = getEnv("VITE_API_BASE_URL") || "https://api.openai-hk.com";
// Clean the URL: remove trailing slash, remove /google, remove /v1 (we append /v1 manually)
const BASE_URL = RAW_BASE_URL.replace(/\/$/, "").replace(/\/google$/, "").replace(/\/v1$/, "");

console.log("Gemini Service (OpenAI-HK Mode):", { hasKey: !!API_KEY, baseUrl: BASE_URL });

// Helper to make OpenAI-Compatible API calls
async function callOpenAICompatibleAPI(messages: any[], schemaDescription?: string) {
  if (!API_KEY) throw new Error("API Key is missing. Check Vercel Environment Variables.");

  const url = `${BASE_URL}/v1/chat/completions`;

  // Explicitly ask for JSON in the system prompt to ensure parsing works
  // We emphasize NO markdown to avoid parsing errors since we removed response_format
  const systemMessage = {
    role: "system",
    content: `You are a helpful assistant. 
    ${schemaDescription ? `You must output valid JSON strictly following this structure: ${schemaDescription}` : "Output valid JSON."}
    IMPORTANT: Do not include markdown formatting (like \`\`\`json ... \`\`\`). Just return the raw JSON string.
    Do not include any conversational text outside the JSON.`
  };

  const body = {
    model: "gemini-1.5-flash", // OpenAI-HK supports this model name via their OpenAI interface
    messages: [systemMessage, ...messages],
    temperature: 0.7, // Lower temperature slightly for more stable JSON structure
    // REMOVED: response_format: { type: "json_object" } 
    // Reason: Many third-party Gemini proxies do not strictly support this OpenAI-specific parameter and will error out.
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}` // OpenAI style auth
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error Details:", response.status, errorText);
    throw new Error(`API Request Failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  let text = data.choices?.[0]?.message?.content;
  
  if (!text) {
    throw new Error("No content in response");
  }

  // Clean up potential markdown formatting if the model ignores instructions
  // (e.g. removes ```json ... ``` wrappers)
  text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");

  return text;
}

// --- EXPORTED FUNCTIONS ---

export const recommendPoem = async (userFeeling: string, language: Language): Promise<Poem> => {
  try {
    let prompt = "";
    if (language === 'zh') {
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

    const schemaDesc = JSON.stringify({
        title: "string",
        author: "string",
        dynasty: "string",
        content: ["string (line 1)", "string (line 2)"],
        analysis: "string (why it matches)",
        context: "string (historical context)"
    });

    const jsonString = await callOpenAICompatibleAPI([{ role: "user", content: prompt }], schemaDesc);
    const poem = JSON.parse(jsonString) as Poem;
    poem.language = language;
    return poem;
  } catch (error) {
    console.error("Error recommending poem:", error);
    const errorMsg = (error as any).message || "";
    
    if (language === 'zh') {
        return {
            title: "出错啦",
            author: "系统",
            dynasty: "当今",
            content: ["网络连接异常", "请检查API配置", "或稍后再试"],
            analysis: errorMsg.includes("401") ? "API Key无效" : `连接失败: ${errorMsg.substring(0, 50)}...`,
            context: "系统提示",
            language: 'zh'
        };
    } else {
        return {
            title: "Connection Error",
            author: "System",
            dynasty: "Modern",
            content: ["Network connection failed", "Check API Settings"],
            analysis: "Unable to connect to AI.",
            context: "System Alert",
            language: 'en'
        };
    }
  }
};

export const analyzePoemKeywords = async (poem: Poem, language: Language): Promise<KeywordCard[]> => {
  try {
    let prompt = "";
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

    const schemaDesc = JSON.stringify([{
        term: "string",
        category: "string",
        description: "string",
        culturalSignificance: "string"
    }]);

    const jsonString = await callOpenAICompatibleAPI([{ role: "user", content: prompt }], schemaDesc);
    return JSON.parse(jsonString) as KeywordCard[];
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

    const schemaDesc = JSON.stringify({
        content: "string (letter body)",
        poet: "string",
        replyTo: "string"
    });

    const jsonString = await callOpenAICompatibleAPI([{ role: "user", content: prompt }], schemaDesc);
    const data = JSON.parse(jsonString);
    return {
        content: data.content,
        poet: poem.author,
        replyTo: userFeeling
    };
  } catch (error) {
    console.error("Error generating letter", error);
    return {
        content: language === 'zh' ? "酒逢知己千杯少，话不投机半句多。今日微醺，暂且搁笔。" : "Words fail me today.",
        poet: poem.author,
        replyTo: userFeeling
    };
  }
};
