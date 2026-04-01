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
  native_image?: string;
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
    
    CRITICAL: YOU MUST RETURN BOTH TEXT AND A PORTRAIT.
    
    1. TEXT: Return a SHORTER JSON object:
    {
      "creature_name": "A unique name",
      "vision": "1 poetic sentence description",
      "leadership_challenge": "2 sentences on leadership",
      "image_prompt": "cinematic description for your own portrait generation",
      "closing": "1 short motivational phrase"
    }

    2. IMAGE: After the JSON, generate a 1:1 cinematic high-fidelity portrait of this creature.
  `;

  // Standard REST URL for the verified 2.0-flash model which supports NATIVE multimodal output
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

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
  const parts = result.candidates?.[0]?.content?.parts || [];
  
  let jsonResult: any = {};
  let imagePart: string | undefined;

  for (const part of parts) {
    if (part.text) {
      try {
        jsonResult = JSON.parse(part.text);
      } catch (e) {
        // Handle potential formatting issues
        const match = part.text.match(/\{[\s\S]*\}/);
        if (match) jsonResult = JSON.parse(match[0]);
      }
    }
    if (part.inlineData) {
      imagePart = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  if (imagePart) jsonResult.native_image = imagePart;
  
  return jsonResult;
}

export async function generateImage(prompt: string): Promise<string> {
  // This is now a tier-2 backup only; the primary logic is one-shot native generation above.
  return `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=800&height=800&nologo=true`;
}
