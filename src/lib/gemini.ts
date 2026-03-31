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
      config: { responseMimeType: "application/json" },
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty AI response");
    return JSON.parse(text);
  } catch (error: any) {
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
  const tryImageGen = async (model: string) => {
    try {
      const resp = await ai.models.generateImages({
        model: model,
        prompt: prompt,
        config: { numberOfImages: 1, aspectRatio: "1:1" }
      });
      const img = resp.generatedImages?.[0] as any;
      return img?.data || img?.imageRaw || img?.bytes || img?.image?.data;
    } catch (e) {
      return null;
    }
  };

  // Tier 1: Primary Model
  let data = await tryImageGen(modelId);
  if (data) return `data:image/png;base64,${data}`;

  // Tier 2: Universal Production Standard (March 2026)
  // Reaching for the most widely available Imagen ID
  const fallbackId = "imagen-3.0-generate-002";
  data = await tryImageGen(fallbackId);
  if (data) return `data:image/png;base64,${data}`;

  // Tier 3: Multimodal Hybrid (Using Gemini to generate the image bytes)
  try {
    console.info("[Alchemist] Attempting Multimodal Image Generation via Gemini 2.0...");
    const multimodalResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: `Generate a square PNG image based on this prompt: ${prompt}` }] }],
    });
    // Some regions allow Gemini to return the image directly in the content stream
    const imgPart = multimodalResponse.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    if (imgPart?.inlineData?.data) {
      return `data:image/png;base64,${imgPart.inlineData.data}`;
    }
  } catch (e) {
    console.warn("Multimodal fallback failed.");
  }

  // FINAL RECOVERY: If everything fails, use a styled placeholder to keep the UI beautiful
  console.error("All AI image generators failed. Check Imagen API status.");
  return `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60`;
}
