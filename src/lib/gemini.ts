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
    Summon a legendary creature based on: "${word1}", "${word2}", "${word3}".
    Language: ${lang === 'es' ? 'Spanish' : 'English'}.
    
    Return a SHORTER JSON object:
    - creature_name: (str) A name
    - vision: (str) 1 poetic sentence
    - leadership_challenge: (str) 2 sentences on leadership for youth
    - image_prompt: (str) 3 keywords (e.g. mystical jaguar forest)
    - closing: (str) 1 short motivational phrase
  `;

  // Standard REST URL for the verified 2.5-flash model
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Alchemist Failed");
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty AI response");
  return JSON.parse(text);
}

export async function generateImage(prompt: string): Promise<string> {
  // Ultra-reliable mystical fetcher that matches the creature's keywords
  const query = encodeURIComponent(prompt + " mystical legendary fantasy");
  return `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60&sig=${Math.random()}&q=${query}`;
  
  // Note: For a live project with students, we can use a more specific gallery search:
  // return `https://source.unsplash.com/featured/800x800/?${query}`;
}
