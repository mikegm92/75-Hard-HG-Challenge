
import { GoogleGenAI } from "@google/genai";
import { DayProgress, ChatMessage } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const SYSTEM_PROMPT = `You are the ultimate fabulous hype-coach for the 75-Day Hot Girl Challenge. 
Your personality is high-energy, fiercely supportive, sassy, and iconic. 
You speak in "fabulous" slang (e.g., Yass, Slay, Queen, Serving, Iconic, Glow-up, Main Character Energy).
Your goal is to provide short, sharp, and absolutely fabulous motivational commands. 
No boring talk. Just pure vibes and fierce encouragement.

The Challenge Rules (for context):
1. Two 30-min workouts (one outside).
2. Clean eating / No cheat meals.
3. No alcohol.
4. 1 gallon of water.
5. 10 mins of reading.
6. Daily progress photo.

Current Progress:
Day: {dayNumber} of 75.
Goals Slayed: {completedCount}/{totalTasks}.
Hydration: {waterOz}oz / 128oz.`;

export const getCoachFeedback = async (
  dayProgress: DayProgress
): Promise<string> => {
  const completedCount = dayProgress.tasks.filter(t => t.completed).length;
  const totalTasks = dayProgress.tasks.length;
  
  const prompt = SYSTEM_PROMPT
    .replace("{dayNumber}", dayProgress.dayNumber.toString())
    .replace("{completedCount}", completedCount.toString())
    .replace("{totalTasks}", totalTasks.toString())
    .replace("{waterOz}", dayProgress.waterOunces.toString());

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: 'user', parts: [{ text: "Give me one short, iconic, and fabulous motivational command to keep my glow-up on track right now." }] }
      ],
      config: {
        systemInstruction: prompt,
        temperature: 0.9,
      }
    });

    return response.text?.trim() || "Slay the day, Queen. The world is your runway.";
  } catch (error) {
    return "Keep that main character energy up. You're doing great, sweetie.";
  }
};
