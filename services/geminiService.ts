
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getDealerCommentary = async (result: number, isWin: boolean): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a high-energy street arcade hype-man. The player ${isWin ? 'WON' : 'LOST'} their bet because the token landed on number ${result}. Give a short, punchy, one-sentence reaction to keep the vibe alive. Use modern slang occasionally. No emojis.`,
      config: {
        temperature: 0.9,
      }
    });

    return response.text?.trim() || (isWin ? "Absolute massive win on " + result + "!" : "Next time's the one, let's go again!");
  } catch (error) {
    console.error("Hype man lost his mic:", error);
    return isWin ? "BOOM! Winner!" : "Tough break, toss it again.";
  }
};
