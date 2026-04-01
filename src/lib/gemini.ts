import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable. Please check your Vercel settings.");
}

// Reverting to the most compatible default (v1beta) 
const ai = new GoogleGenAI({ apiKey });

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

  // Tiered Fallback IDs: Try everything until one works
  const candidateIds = [
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-2.0-flash-exp",
    "gemini-pro"
  ];

  for (const id of candidateIds) {
    try {
      console.log(`[Alchemist] Attempting invocation with: ${id}`);
      const response = await ai.models.generateContent({
        model: id,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;
      
      // Clean JSON if it's wrapped in markdown
      const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (error: any) {
      console.warn(`[Alchemist] Model ${id} failed:`, error.message);
      // If we hit a rate limit (429), just stop and fail gracefully
      if (error.status === 429) break;
      continue;
    }
  }

  throw new Error("No available models found for this API project. Check Google AI Studio.");
}

export async function generateImage(prompt: string): Promise<string> {
  return `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60&sig=${Math.random()}`;
}
