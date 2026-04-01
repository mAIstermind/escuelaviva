import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export interface AlchemistResponse {
  creature_name: string;
  vision: string;
  leadership_challenge: string;
  image_prompt: string;
  closing: string;
  native_image?: string;
}

export interface Message {
  role: "user" | "model";
  text: string;
  timestamp: number;
  data?: AlchemistResponse;
  imageUrl?: string;
}

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable. Please check your Vercel settings.");
}

const ai = new GoogleGenAI({ apiKey });

// In March 2026, gemini-2.0-flash is the most reliable "All-in-One" model.
// We use it as the backbone to avoid 404/429 errors from tiered model access.
export const modelId = "gemini-2.0-flash";

export async function generateCreature(word1: string, word2: string, word3: string, lang: string) {
  const prompt = `
    Summon a legendary creature based on these 3 alchemy words: "${word1}", "${word2}", "${word3}".
    Language: ${lang === 'es' ? 'Spanish' : 'English'}.
    
    Return a JSON object WITH an image:
    - creature_name: (str) A unique, powerful name
    - vision: (str) A 1-sentence poetic description
    - leadership_challenge: (str) A 2-sentence challenge related to youth leadership
    - image_prompt: (str) A cinematic prompt for its portrait
    - closing: (str) A final motivating phrase
    
    IMPORTANT: You are a Multimodal Alchemist. Use your NATIVE IMAGE GENERATION to produce a portrait of this being as an inline image part.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const text = response.candidates?.[0]?.content?.parts?.find(p => p.text)?.text;
    if (!text) throw new Error("Empty AI response");
    
    const parsed = JSON.parse(text);
    
    // Check if the model followed instructions and generated the image part natively
    const imgPart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    if (imgPart?.inlineData?.data) {
      parsed.native_image = `data:image/png;base64,${imgPart.inlineData.data}`;
    }
    
    return parsed;
  } catch (error: any) {
    console.error("Alchemist Core Error:", error);
    // Robust fallback to 1.5-flash for text if 2.0 is rate-limited
    const fallbackResponse = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });
    const fallbackText = fallbackResponse.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!fallbackText) throw error;
    return JSON.parse(fallbackText);
  }
}

export async function generateImage(prompt: string, nativeImage?: string): Promise<string> {
  // If the one-shot generation already provided the image, use it!
  if (nativeImage) return nativeImage;

  try {
    // If we reach here, we need a separate request. We try the fastest reliable model.
    const resp = await ai.models.generateImages({
      model: "imagen-3-fast",
      prompt: prompt,
      config: { numberOfImages: 1, aspectRatio: "1:1" }
    });
    const img = resp.generatedImages?.[0] as any;
    const data = img?.data || img?.imageRaw || img?.bytes;
    if (data) return `data:image/png;base64,${data}`;
  } catch (e) {
    console.warn("Manual image generation failed, falling back to mystical repository.");
  }

  // Mystical fallback theme: Ancient Knowledge / School
  return `https://images.unsplash.com/photo-1532012197267-da84d092323f?w=800&auto=format&fit=crop&q=60`;
}
