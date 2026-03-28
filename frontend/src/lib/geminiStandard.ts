import { GoogleGenAI, Type } from "@google/genai";
import type { GameItem } from "./stateMachine";

let ai: GoogleGenAI | null = null;

export async function initializeGenAI(): Promise<GoogleGenAI> {
  if (ai) return ai;
  try {
    // In our hybrid hackathon architecture, the backend just provides the key securely
    // In real production, we'd proxy this request or use proper OAuth/Vertex tokens.
    // Ensure we handle Vite's proxy path or absolute dev path if running standalone
    const fetchUrl = import.meta.env.DEV ? 'http://localhost:3001/api/token' : '/api/token';
    const res = await fetch(fetchUrl);
    if (!res.ok) throw new Error('Failed to fetch API token');
    const data = await res.json();
    
    // The @google/genai SDK accepts the API key directly for initialization
    ai = new GoogleGenAI({ apiKey: data.token });
    return ai;
  } catch (err) {
    console.error("Failed to initialize GenAI client:", err);
    throw err;
  }
}

export async function generateArtifactFromObject(scannedObject: string): Promise<GameItem> {
  const client = await initializeGenAI();
  
  const prompt = `The player, wandering around the Software Mansion hackathon, accidentally opened the 'Wrong Room' door and stepped into an absurd dimension blending a futuristic AI utopia with dark medieval fantasy. They brought a '${scannedObject}' with them.
Transform this mundane item into a bizarre, powerful, somewhat cursed or surprisingly magical artifact suitable for this absurd futuristic-medieval setting.

You must return a JSON object containing:
- "name": The epic, absurd, or sci-fi/fantasy name of this new artifact.
- "description": 1 or 2 sentence atmospheric lore description of what the object looks like now and its history in this strange dimension.
- "mechanicTag": Categorize it as exactly ONE of these three classifications based on how it could be used: "combat" (weapons or damage), "utility" (light, escape, tools), or "magic" (spells, charms, trickery).`;

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash', // Flash is perfect for fast, structured JSON generation
    contents: prompt,
    config: {
      temperature: 0.9,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          mechanicTag: { 
            type: Type.STRING, 
            enum: ["combat", "utility", "magic"] 
          }
        },
        required: ["name", "description", "mechanicTag"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate item: API returned empty response.");
  }
  
  return JSON.parse(response.text) as GameItem;
}
