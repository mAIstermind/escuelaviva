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
  const tryGenerateImage = async (targetModel: string) => {
    try {
      const resp = await ai.models.generateImages({
        model: targetModel,
        prompt: prompt,
        config: { numberOfImages: 1, aspectRatio: "1:1" }
      });
      const img = resp.generatedImages?.[0] as any;
      return img?.data || img?.imageRaw || img?.bytes || img?.image?.data;
    } catch (e: any) {
      console.warn(`[Probe] Model ${targetModel} is unavailable:`, e.message);
      return null;
    }
  };

  // Tier 1: User Preference
  let data = await tryGenerateImage(modelId);
  if (data) return `data:image/png;base64,${data}`;

  // Tier 2: Dynamic Total Discovery
  try {
    console.log("[Probe] Performing FULL project model audit...");
    const available = await ai.models.list();
    const allNames = available.models?.map(m => m.name) || [];
    
    // Print EVERYTHING to the console so we can see the hidden IDs
    console.info("[Probe] ALL available models for this API key:", allNames);
    
    const imageModels = available.models?.filter(m => 
      m.supportedMethods?.some((meth: string) => meth.toLowerCase().includes("image")) || 
      m.name?.toLowerCase().includes("imagen")
    );
    
    if (imageModels && imageModels.length > 0) {
      const bestMatch = imageModels[0].name?.replace("models/", "");
      if (bestMatch) {
         console.info(`[Probe] Attempting discovery match: ${bestMatch}`);
         data = await tryGenerateImage(bestMatch);
         if (data) return `data:image/png;base64,${data}`;
      }
    }
  } catch (e) {
    console.error("[Probe] Audit failed.", e);
  }

  // Tier 3: Known Common Cluster IDs
  const candidates = ["imagen-3-fast", "imagen-3", "gemini-2.0-flash", "imagen-3.0-generate-001", "imagen-v3"];
  for (const candidate of candidates) {
    data = await tryGenerateImage(candidate);
    if (data) return `data:image/png;base64,${data}`;
  }

  throw new Error("No image models found. Please check Google AI Studio settings for Imagen access.");
}
