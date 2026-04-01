const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable. Please check your Vercel settings.");
}

export interface AlchemistResponse {
  creature_name: string;
  vision: string;
  leadership_challenge: string;
  image_prompt: string;
  closing: string;
}

export interface Message {
  role: "user" | "model";
  text: string;
  timestamp: number;
  data?: AlchemistResponse;
  imageUrl?: string;
}

export async function generateCreature(word1: string, word2: string, word3: string, lang: string): Promise<AlchemistResponse> {
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

  const candidates = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro", "gemini-2.0-flash-exp"];
  
  for (const modelId of candidates) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return JSON.parse(text);
      }
    } catch (e) {
      console.warn(`Scout failed for ${modelId}`);
    }
  }

  // If even the candidates fail, we do a total system audit
  try {
     const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
     const listResp = await fetch(listUrl);
     const listData = await listResp.json();
     console.error("TOTAL MODELS AVAILABLE FOR THIS KEY:", listData.models?.map((m: any) => m.name));
  } catch (e) {
     console.error("Total audit failed.");
  }

  throw new Error("The Alchemist is blinded. Please check your Google AI Studio API key and quota.");
}

export async function generateImage(prompt: string): Promise<string> {
  // Ultra-reliable mystical fetcher
  return `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60&sig=${Math.random()}`;
}
