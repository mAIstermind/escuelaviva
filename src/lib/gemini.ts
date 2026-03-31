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
    console.error("Gemini Error:", error);
    // Reliable fallback if 2.5-flash is temporarily non-existent on the endpoint
    if (error.status === 404 || error.message?.includes("not found")) {
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
  try {
    const response = await ai.models.generateImages({
      model: modelId, 
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "1:1",
      },
    });

    const img = response.generatedImages?.[0] as any;
    const imageData = img?.data || img?.imageRaw || img?.bytes || img?.image?.data;
    
    if (imageData) {
      return `data:image/png;base64,${imageData}`;
    }
    throw new Error("No image data in response");
  } catch (error: any) {
    console.error("Gemini Image Error:", error);
    // Vercel console confirmed gemini-2.5-flash-image is NOT FOUND. 
    // Falling back to imagen-3 (the production standard for images in March 2026).
    if (error.status === 404 || error.message?.includes("not found")) {
       const retryResponse = await ai.models.generateImages({
         model: "imagen-3", 
         prompt: prompt,
         config: { numberOfImages: 1, aspectRatio: "1:1" },
       });
       const retryImg = retryResponse.generatedImages?.[0] as any;
       const retryData = retryImg?.data || retryImg?.imageRaw || retryImg?.bytes;
       if (retryData) return `data:image/png;base64,${retryData}`;
    }
    throw error;
  }
}
