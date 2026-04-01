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
        Summon a unique legendary leadership creature based ONLY on: "${word1}", "${word2}", "${word3}".
        Language: ${lang === 'es' ? 'Spanish' : 'English'}.
        
        Return a JSON object:
        {
          "creature_name": "Unique Name",
          "vision": "1 poetic description",
          "leadership_challenge": "2 sentences on leadership for youth",
          "image_prompt": "cinematic hyper-realistic 1:1 portrait of this creature",
          "closing": "1 short motivational phrase"
        }
      `;

      // STRICT LOCK: GEMINI 2.5 FLASH - preview-04-17 is current live version
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
          console.log(`Deep rate limit hit. Waiting 65s for attempt ${attempts}...`);
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
      const imageQuery = encodeURIComponent(jsonResult.image_prompt + " cinematic masterpiece mystical creature portrait");
      const imageUrl = `https://image.pollinations.ai/prompt/${imageQuery}?width=800&height=800&nologo=true&seed=${Date.now()}`;

      return res.status(200).json({ ...jsonResult, imageUrl });

    } catch (error: any) {
      if (attempts >= maxAttempts - 1) {
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
      }
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}
