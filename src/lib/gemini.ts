export interface AlchemistResponse {
  creature_name: string;
  vision: string;
  leadership_challenge: string;
  image_prompt: string;
  closing: string;
  imageUrl?: string;
}

export interface Message {
  role: "user" | "model";
  text: string;
  timestamp: number;
  data?: AlchemistResponse;
  imageUrl?: string;
}

export async function generateCreature(word1: string, word2: string, word3: string, lang: string): Promise<AlchemistResponse> {
  const response = await fetch('/api/alchemist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word1, word2, word3, lang })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Alchemist failed to summon.");
  }

  const result = await response.json();
  return result;
}

export async function generateImage(prompt: string): Promise<string> {
  // Now handled by the proxy, this is a local fallback returning the already-fetched URL
  return `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=800&height=800&nologo=true`;
}
