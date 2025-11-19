
import { Poem, KeywordCard, PoetLetter, Language } from "../types";

// --- CONFIGURATION FROM PROVIDED HTML ---
const API_CONFIG = {
  apiKey: 'hk-emzmdm100001546880118f3e8611dc35e14abc9adb46e5f7',
  baseURL: 'https://api.openai-hk.com',
  model: 'gpt-3.5-turbo',
};

console.log("Gemini Service (Ported from HTML):", { 
  hasKey: !!API_CONFIG.apiKey, 
  baseUrl: API_CONFIG.baseURL,
  model: API_CONFIG.model
});

// Generic API Call Function adapted from your HTML example
const callAPI = async (messages: any[], maxTokens = 2000) => {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: API_CONFIG.model,
        max_tokens: maxTokens,
        messages: messages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};

// Helper to clean JSON string (remove markdown code blocks)
const cleanJson = (text: string) => {
    return text.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim();
};

// --- EXPORTED FUNCTIONS ---

export const recommendPoem = async (userFeeling: string, language: Language): Promise<Poem> => {
  try {
    const isZh = language === 'zh';
    const typeRequest = isZh ? 
      (Math.random() < 0.2 ? "Song Dynasty Lyric (Ci) (宋词)" : "Tang or Song Dynasty Poem (Shi) (唐诗/宋诗)") 
      : "Classic Western Poem";

    const messages = [
      {
        role: "system",
        content: `You are a professional poetry recommendation assistant. 
        Return ONLY valid JSON. No markdown formatting.
        Structure:
        {
          "title": "string",
          "author": "string",
          "dynasty": "string (e.g. Tang/Song or Victorian)",
          "content": ["line 1", "line 2"...],
          "analysis": "string (why it matches feeling)",
          "context": "string (historical background)"
        }
        DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON.`
      },
      {
        role: "user",
        content: `User feeling: "${userFeeling}".
        Recommend a ${typeRequest}.
        ${isZh ? "Return in Traditional Chinese." : "Return in English."}`
      }
    ];

    const responseText = await callAPI(messages);
    const poem = JSON.parse(cleanJson(responseText)) as Poem;
    poem.language = language;
    
    // Ensure content is an array (gpt-3.5 might sometimes return a single string)
    if (typeof poem.content === 'string') {
        poem.content = (poem.content as string).split('\n');
    }
    
    return poem;
  } catch (error) {
    console.error("Error recommending poem:", error);
    const errorMsg = (error as any).message || "";
    return {
        title: language === 'zh' ? "出错啦" : "Error",
        author: language === 'zh' ? "系统" : "System",
        dynasty: language === 'zh' ? "当今" : "Modern",
        content: language === 'zh' ? ["网络连接异常", "请检查API配置", "或稍后再试"] : ["Network Error", "Please check API", "Try again later"],
        analysis: errorMsg.substring(0, 100),
        context: "System Alert",
        language: language
    };
  }
};

export const analyzePoemKeywords = async (poem: Poem, language: Language): Promise<KeywordCard[]> => {
  try {
    const isZh = language === 'zh';
    const messages = [
      {
        role: "system",
        content: `You are an expert in poetry imagery and geography.
        Return ONLY valid JSON array. No markdown.
        Structure:
        [
          {
            "term": "string",
            "category": "${isZh ? "地理/物候/风土" : "Setting/Imagery/Symbolism"}",
            "description": "string",
            "culturalSignificance": "string"
          }
        ]
        DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON.`
      },
      {
        role: "user",
        content: `Analyze this poem:
        Title: ${poem.title}
        Author: ${poem.author}
        Content: ${poem.content.join('\n')}
        
        Extract 3-4 key terms. ${isZh ? "Output in Chinese." : "Output in English."}`
      }
    ];

    const responseText = await callAPI(messages);
    return JSON.parse(cleanJson(responseText)) as KeywordCard[];
  } catch (error) {
    console.error("Error analyzing keywords:", error);
    return [];
  }
};

export const generatePoetLetter = async (poem: Poem, userFeeling: string, language: Language): Promise<PoetLetter> => {
  try {
    const isZh = language === 'zh';
    const messages = [
      {
        role: "system",
        content: `You are a roleplay AI acting as the poet ${poem.author}.
        Return ONLY valid JSON. No markdown.
        Structure:
        {
           "content": "string (the letter body)",
           "poet": "string (poet name)",
           "replyTo": "string (user feeling)"
        }
        DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON.`
      },
      {
        role: "user",
        content: `User feeling: "${userFeeling}".
        You wrote: ${poem.title}.
        Write a gentle, intimate letter to the user connecting your life/poem to their feeling.
        Keep it under 200 words.
        ${isZh ? "Output in Chinese." : "Output in English."}`
      }
    ];

    const responseText = await callAPI(messages);
    const data = JSON.parse(cleanJson(responseText));
    return {
        content: data.content,
        poet: poem.author,
        replyTo: userFeeling
    };
  } catch (error) {
    console.error("Error generating letter", error);
    return {
        content: language === 'zh' ? "提笔忘言，纸短情长。今日暂且搁笔。" : "Words fail me today.",
        poet: poem.author,
        replyTo: userFeeling
    };
  }
};
