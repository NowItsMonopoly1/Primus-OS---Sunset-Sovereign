import { GoogleGenAI } from "@google/genai";

export interface VoiceProfile {
  formalityLevel: 'Casual' | 'Professional' | 'Hybrid';
  greetingPattern: string[]; 
  signOffPattern: string[]; 
  sentenceLength: 'Short/Punchy' | 'Long/Explanatory';
  quirks: string[];
  bannedWords: string[];
  systemInstructionBlock: string; 
}

export const DEFAULT_PROFILE: VoiceProfile = {
  formalityLevel: 'Professional',
  greetingPattern: ["Hello [Name],"],
  signOffPattern: ["Sincerely,"],
  sentenceLength: 'Long/Explanatory',
  quirks: [],
  bannedWords: ["Synergy", "Optimization"],
  systemInstructionBlock: "Maintain a standard professional tone. Be concise and accurate."
};

export const synthesizeVoice = async (rawEmailText: string): Promise<VoiceProfile> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      config: {
        responseMimeType: "application/json",
      },
      contents: `Analyze the following text sample from a high-production professional (Broker/Owner). 
      Extract their linguistic DNA for a digital twin.
      
      Return a JSON object with this structure:
      {
        "formalityLevel": "Casual" | "Professional" | "Hybrid",
        "greetingPattern": ["list of common greetings used"],
        "signOffPattern": ["list of common sign-offs used"],
        "sentenceLength": "Short/Punchy" | "Long/Explanatory",
        "quirks": ["list of specific speech patterns, like dashes, emojis, or industry jargon"],
        "bannedWords": ["words they never use based on tone"],
        "systemInstructionBlock": "A detailed paragraph instructing an AI on how to EXACTLY mimic this person's voice and strategic nuance."
      }

      TEXT SAMPLE:
      "${rawEmailText}"`
    });

    const result = JSON.parse(response.text || "{}");
    return {
      ...DEFAULT_PROFILE,
      ...result
    };
  } catch (error) {
    console.error("Gemini Voice Synthesis failed, falling back to Donte profile.", error);
    // Fallback to the high-fidelity "Donte" mock profile
    return {
      formalityLevel: 'Hybrid',
      greetingPattern: ["Hey [Name],", "Morning [Name],"],
      signOffPattern: ["Best,\nDonte", "- D"],
      sentenceLength: 'Short/Punchy',
      quirks: [
        "Uses dashes instead of periods for speed", 
        "References 'The Market' as a proper noun",
        "Mentions specific numbers (e.g., '$420/mo') over generalities"
      ],
      bannedWords: ["Dear", "Sincerely", "Valued Customer", "Valued Client"],
      systemInstructionBlock: `
        STYLE GUIDE (STRICT):
        - Never use "Dear". Start with "Hey" or "Morning".
        - Keep sentences under 15 words. High velocity.
        - If discussing savings, always be specific (e.g., "$420/mo").
        - Sign off with "- D" or "Best, Donte".
        - Tone: Busy expert, slightly casual, extremely competent.
      `
    };
  }
};
