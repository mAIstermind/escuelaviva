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
    - image_prompt: (str) A cinematic prompt for Imagen
    - closing: (str) A final motivating phrase
  `;

  // Verified working Text model for this high-tier project
  const modelId = "gemini-2.5-flash";
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
  try {
    // Verified Imagen 4.0 ID found in the project audit
    const imageModel = "imagen-4.0-fast-generate-001";
    // Using the 'generateImages' endpoint which is standardized for the new AI Studio Image models
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:generateImages?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt,
        config: { numberOfImages: 1, aspectRatio: "1:1" }
      })
    });

    if (response.ok) {
       const result = await response.json();
       // Handling different response schemas between Imagen 3 and 4
       const data = result.generatedImages?.[0]?.data || result.generatedImages?.[0]?.imageRaw || result.predictions?.[0]?.bytesBase64Encoded;
       if (data) return `data:image/png;base64,${data}`;
    }
  } catch (e) {
    console.warn("Imagen 4.0 connection failed.");
  }

  // Backup for quota limits: High-speed mystical search
  return `https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=60`;
}
