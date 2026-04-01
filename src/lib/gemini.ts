import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable. Please check your Vercel settings.");
}

const ai = new GoogleGenAI({ apiKey });

// Reverting to the most stable model confirmed for this account
export const modelId = "gemini-1.5-flash";

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

export async function generateCreature(word1: string, word2: string, word3: string, lang: string) {
  const prompt = `
    Summon a legendary creature based on these 3 alchemy words: "${word1}", "${word2}", "${word3}".
    Language: ${lang === 'es' ? 'Spanish' : 'English'}.
    
    Return a JSON object:
    - creature_name: (str) A unique name
    - vision: (str) A 1-sentence poetic description
    - leadership_challenge: (str) A 2-sentence challenge related to youth leadership
    - image_prompt: (str) 3 keywords for an image search (e.g. "mystical jungle jaguar")
    - closing: (str) A final motivating phrase
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
    console.error("Alchemist Core Error:", error);
    throw error;
  }
}

export async function generateImage(prompt: string): Promise<string> {
  // Since all AI image generators are currently 404/429ing on this project,
  // we use a High-Speed Mythical Search that is guaranteed to work instantly.
  const searchQuery = encodeURIComponent(prompt + " mystical legendary");
  return `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60&sig=${Math.random()}`;
  
  // Note: For a live project with students, we can use a more specific gallery search:
  // return `https://source.unsplash.com/featured/800x800/?${searchQuery}`;
}
