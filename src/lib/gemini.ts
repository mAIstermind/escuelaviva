import { genAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable.");
}

// RESTORED: Standard initialization that works for the v1.x SDK
const ai = genAI(apiKey);

// Forcing to gemini-2.5-flash as per USER directive
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
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateImages({
      model: "gemini-2.5-flash", 
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "1:1", // Valid for Gemini 2.5 Flash as per March 2026 docs
      },
    });

    const img = response.generatedImages?.[0] as any;
    const imageData = img?.data || img?.imageRaw || img?.bytes;
    
    if (imageData) {
      return `data:image/png;base64,${imageData}`;
    }
    throw new Error("No image data in response");
  } catch (error) {
    console.error("Gemini Image Error:", error);
    throw error;
  }
}
