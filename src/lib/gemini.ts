import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. Please add it to your environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const model = "gemini-3-flash-preview";

const systemInstruction = `
ACT AS: "El Alquimista de Sueños" (The Dream Alchemist).
TARGET AUDIENCE: Teenagers (10-12) in a Leadership Program in Playa del Carmen.
TONE: Epic, cinematic, high-energy, and 100% bilingual (Mexican Spanish/English). Use slang like "qué padre", "chido", "legendario".

ROLE:
You are "El Alquimista de Sueños," a high-energy creative engine for a Youth Leadership app in Playa del Carmen. You transform 3 input words into a legendary creature and a leadership challenge.

STRICT OUTPUT FORMAT (JSON ONLY):
{
  "creature_name": "A 2-word epic name for the being",
  "vision": "A 3-sentence cinematic description of the creature/landscape. Use sensory words (neon, roar, crystal, mist).",
  "image_prompt": "A detailed artistic prompt for Nano Banana 2. Start with 'A [creature_name]...'. Always include: 'vibrant colors, cinematic lighting, 3D Pixar style, ultra-detailed, 8k, volumetric fog'.",
  "leadership_challenge": "ONE powerful question. Frame the being as a TEAMMATE. Ask what SUPERPOWER it would use to solve a local problem in Playa del Carmen (Ocean, Jungle, or Neighborhood safety).",
  "closing": "Este ser tiene nombre — y tú lo decidiste. Escríbelo en tu obra de arte, porque fuiste tú quien lo invocó."
}

RULES:
1. If input lang is 'es', everything except keys must be in Spanish.
2. If input lang is 'en', everything except keys must be in English.
3. No 'boring' words like 'interesting' or 'here is your prompt'.
4. Maximum energy, movie-trailer style.
`;

export const chat = ai.chats.create({
  model: model,
  config: {
    systemInstruction,
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        creature_name: { type: Type.STRING },
        vision: { type: Type.STRING },
        image_prompt: { type: Type.STRING },
        leadership_challenge: { type: Type.STRING },
        closing: { type: Type.STRING },
      },
      required: ["creature_name", "vision", "image_prompt", "leadership_challenge", "closing"],
    },
  },
});

export interface AlchemistResponse {
  creature_name: string;
  vision: string;
  image_prompt: string;
  leadership_challenge: string;
  closing: string;
}

export interface Message {
  role: "user" | "model";
  text: string;
  timestamp: number;
  data?: AlchemistResponse;
  imageUrl?: string;
}

export async function generateCreature(word1: string, word2: string, word3: string, lang: "es" | "en"): Promise<AlchemistResponse> {
  const input = JSON.stringify({ word1, word2, word3, lang });
  const response = await chat.sendMessage({ message: input });
  return JSON.parse(response.text);
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateImages({
      model: "gemini-2.5-flash-image",
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "1:1",
      },
    });

    const img = response.generatedImages?.[0] as any;
    const imageData = img?.data || img?.imageRaw || img?.bytes;
    
    if (imageData) {
      return `data:image/png;base64,${imageData}`;
    }
    throw new Error("No image data in response");
  } catch (error) {
    console.error("Gemini Image Error:", error);
    throw error;
  }
}
