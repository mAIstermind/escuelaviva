// Vercel Serverless Function Proxy for Escuela Viva Alchemist
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { word1, word2, word3, lang } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const prompt = `
        Summon a unique leadership creature based on: "${word1}", "${word2}", "${word3}".
        Language: ${lang === 'es' ? 'Spanish' : 'English'}.

        INSTRUCTION: You are a professional AI image engineer and a poetic visionary. 
        The "metadata" section MUST be extremely technical, using sensory-rich keywords and professional art terminology. Avoid generic descriptions like 'realistic' or 'cinematic'. Use specific art movements, lighting temperatures, and camera hardware references.

        Return this precise JSON structure:
        {
          "creature_name": "Unique Name",
          "vision": "1-sentence high-level visionary motto",
          "leadership_challenge": "2 short, piercing sentences on leadership",
          "image_prompt": "100-word masterpiece prompt that is poetic yet hyper-descriptive, focusing on the synergy of ${word1}, ${word2}, and ${word3}",
          "metadata": {
            "style": "Specific art movement (e.g., Cybernetic Expressionism, Giger-esque Biomechanics, Ultra-detailed Matte Painting)",
            "palette": "Technical colors (e.g., Anodized Cobalt, 7000K Kelvin solar flares, obsidian-ink shadows)",
            "details": "Hyper-technical texture info (e.g., micro-etched circuit paths on translucent obsidian skin, organic sargassum fibrous weaves with 8k displacement maps)",
            "composition": "Professional camera specs (e.g., 24mm wide-angle lens, f/1.8 depth of field, Rembrandt lighting, dramatic low-angle silhouette)"
          },
          "closing": "Short motivational phrase"
        }
      `;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            responseMimeType: "application/json",
            temperature: 0.9, // Higher temperature for more creative/descriptive results
          }
        })
      });

      if (response.status === 429) {
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 65000));
          continue;
        }
      }

      const result: any = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty AI response");

      const jsonResult = JSON.parse(text);
      return res.status(200).json(jsonResult);

    } catch (error: any) {
      if (attempts >= maxAttempts - 1) {
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
      }
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}
