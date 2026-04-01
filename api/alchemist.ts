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
        
        Return a focus visual JSON object:
        {
          "creature_name": "Unique Name",
          "vision": "1-sentence visionary motto",
          "leadership_challenge": "2 short sentences on leadership",
          "image_prompt": "highly descriptive cinematic image prompt based on ${word1}, ${word2}, ${word3}",
          "metadata": {
            "style": "Visual style",
            "palette": "Color palette",
            "details": "Technical texture details",
            "composition": "Framing details"
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
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (response.status === 429) {
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 65000));
          continue;
        }
      }

      if (!response.ok) {
        const err: any = await response.json();
        throw new Error(err.error?.message || "Google API Failed");
      }

      const result: any = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty AI response");

      const jsonResult = JSON.parse(text);
      
      // CLEAN RESPONSE: Only return what is needed for the prompt engine
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
