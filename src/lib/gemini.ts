import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable. Please check your Vercel settings.");
}

// Fixed initialization using the official GoogleGenAI class
const ai = new GoogleGenAI({ apiKey });

// User confirmed model ID: Priority 1
export const modelId = "gemini-2.5-flash";

export async function generateCreature(word1: string, word2: string, word3: string, lang: string) {
  const prompt = `
    Summon a legendary creature based on these 3 alchemy words: "${word1}", "${word2}", "${word3}".
    Language: ${lang === 'es' ? 'Spanish' : 'English'}.
    
    Return a JSON object with:
    - creature_name: (str) A unique, powerful name for the being
    - vision: (str) A 1-sentence poetic description of its essence
    - leadership_challenge: (str) A 2-sentence challenge related to youth leadership (collaboration, vision, or courage)
    - image_prompt: (str) An artistic, detailed description to generate an square, cinematic, mystical image of this being
    - closing: (str) A final motivating alchemy phrase
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty AI response");
    return JSON.parse(text);
  } catch (error: any) {
    if (error.status === 404 || error.message?.includes("not found")) {
      // Fallback for text: gemini-1.5-flash is universally available since 2024
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" },
      });
      const fallbackText = fallbackResponse.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!fallbackText) throw error;
      return JSON.parse(fallbackText);
    }
    throw error;
  }
}

export async function generateImage(prompt: string): Promise<string> {
  const tryGenerate = async (targetModel: string) => {
    const response = await ai.models.generateImages({
      model: targetModel,
      prompt: prompt,
      config: { numberOfImages: 1, aspectRatio: "1:1" },
    });
    const img = response.generatedImages?.[0] as any;
    return img?.data || img?.imageRaw || img?.bytes || img?.image?.data;
  };

  try {
    // Attempt 1: User's confirmed model
    const data = await tryGenerate(modelId);
    if (data) return `data:image/png;base64,${data}`;
    throw new Error("No data");
  } catch (error: any) {
    console.warn(`Primary model ${modelId} failed:`, error.message);
    
    // Attempt 2: imagen-3-fast (Usually the most available flash image model in March 2026)
    try {
      const data = await tryGenerate("imagen-3-fast");
      if (data) return `data:image/png;base64,${data}`;
    } catch (e) {
      console.warn("imagen-3-fast also failed, trying universal discovery...");
    }

    // Attempt 3: Discovery Fallback
    // We try to use gemini-2.0-flash which has multimodal generation output by March 2026
    try {
      const data = await tryGenerate("gemini-2.0-flash");
      if (data) return `data:image/png;base64,${data}`;
    } catch (finalError) {
      console.error("All image generation attempts failed.");
      throw finalError;
    }
    
    throw error;
  }
}
