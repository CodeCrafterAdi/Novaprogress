
import { GoogleGenAI } from "@google/genai";
import { Task } from "../types";

// Helper to get client with dynamic key
const getClient = (apiKey: string) => {
  if (!apiKey) throw new Error("LINK_SEVERED: NO API KEY DETECTED.");
  return new GoogleGenAI({ apiKey });
};

// Centralized Error Handler for Gemini
const handleAIError = (error: any): string => {
  const msg = error.toString().toLowerCase();
  
  if (msg.includes("400") || msg.includes("invalid argument") || msg.includes("api key not valid")) {
    return "CRITICAL FAILURE: API KEY INVALID. PLEASE UPDATE CREDENTIALS.";
  }
  
  if (msg.includes("429") || msg.includes("quota") || msg.includes("resource exhausted")) {
    return "SYSTEM OVERLOAD: API QUOTA EXCEEDED. YOUR KEY HAS RUN OUT OF JUICE. ACQUIRE A NEW KEY.";
  }

  if (msg.includes("fetch failed") || msg.includes("network")) {
    return "CONNECTION LOST: CHECK NETWORK STATUS.";
  }

  return `UNKNOWN ERROR: ${msg.substring(0, 50)}...`;
};

export const analyzePhysiqueImage = async (base64Image: string, userKey?: string): Promise<string> => {
  try {
    const key = userKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) return "SYSTEM ERROR: No API Key found in Identity Module.";

    const ai = getClient(key);
    
    // Remove header if present (data:image/jpeg;base64,)
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', 
              data: cleanBase64
            }
          },
          {
            text: `Act as an elite fitness coach and biological analyzer (Nova System). 
            Analyze this physique update photo. 
            1. Estimate body fat percentage range.
            2. Identify 1 strong point (muscle group).
            3. Identify 1 area needing improvement (weak point).
            4. Give a 1-sentence "Hunter Directive" for the next week.
            
            Tone: Dark, Cyberpunk, Serious.`
          }
        ]
      }
    });

    return response.text || "Analysis complete. No data returned.";
  } catch (error) {
    return handleAIError(error);
  }
};

export const generateRoadmapSuggestions = async (currentTasks: Task[], userKey?: string): Promise<string> => {
  try {
    const key = userKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) return "SYSTEM ERROR: No API Key found.";

    const ai = getClient(key);
    
    const taskList = currentTasks.map(t => `- [${t.temple_id}] ${t.title} (${t.completed ? 'DONE' : 'PENDING'})`).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: `You are the Nova System Oracle. Analyze the user's current roadmap/task list:
            
            ${taskList}

            Based on this, suggest 3 specific next-step tasks (directives) to optimize their growth.
            Focus on gaps in their skills or logical progressions.
            Format as:
            1. [CATEGORY] Task Name - Brief reason
            2. [CATEGORY] Task Name - Brief reason
            3. [CATEGORY] Task Name - Brief reason
            
            Tone: Dark, Cyberpunk, Elite.`
          }
        ]
      }
    });

    return response.text || "No directives generated.";
  } catch (error) {
    return handleAIError(error);
  }
};

export const analyzeJournalEntry = async (content: string, userKey?: string): Promise<string> => {
  try {
    const key = userKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) return "SYSTEM ERROR: No API Key found.";

    const ai = getClient(key);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: `Analyze this user's journal entry (Mental Log) as a psychological profiler AI (Nova System).
            
            ENTRY: "${content}"
            
            Output:
            1. MENTAL STATE: (One word, e.g., FOCUSED, ERRATIC, DEFEATED)
            2. HIDDEN WEAKNESS: (What is holding them back based on this text?)
            3. TACTICAL ADVICE: (One actionable step to fix their mindset).
            
            Tone: Cold, analytical, extremely concise.`
          }
        ]
      }
    });

    return response.text || "Log corrupted. No analysis.";
  } catch (error) {
    return handleAIError(error);
  }
};

export const parseVoiceCommand = async (transcript: string, userKey?: string): Promise<any> => {
  try {
    const key = userKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) throw new Error("API KEY MISSING");

    const ai = getClient(key);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [{
                text: `You are the Voice Command Processor for NovaProgress.
                User Command: "${transcript}"
                
                Analyze intent and return STRICT JSON.
                
                If creating a task:
                {
                   "type": "CREATE_TASK",
                   "title": "Task Title",
                   "temple_id": "FITNESS" | "SKILLS" | "BUSINESS" | "MISSION" | "HOME", (Infer best fit, default HOME),
                   "xp": 10-50,
                   "complexity": "E" | "D" | "C" | "B" | "A" | "S",
                   "subtasks": ["Subtask 1", "Subtask 2"] (if mentioned)
                }

                If creating a category:
                {
                   "type": "CREATE_CATEGORY",
                   "name": "Category Name",
                   "color": "Hex Color" (Infer from name or random vivid color)
                }

                If unknown/garbage:
                { "type": "UNKNOWN" }
                
                JSON ONLY. NO MARKDOWN.`
            }]
        }
    });

    let text = response.text || "{}";
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (e) {
      console.error("Voice Parse Error", e);
      return { type: "UNKNOWN" };
  }
};
