import { GoogleGenAI, Modality } from "@google/genai";

// Standard initialization using process.env.GEMINI_API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const generateMovieExplanation = async (movieTitle: string, overview: string, language: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a movie expert for a site called DarkDoddle which focus on thriller, horror, and mystery. 
      Provide a short, suspense-free brief summary and explanation for the movie "${movieTitle}" strictly in the ${language} language script. 
      The overview provided is: ${overview}. 
      Make it engaging and fit the dark theme of the site. Limit to 3-4 sentences. 
      IMPORTANT: You must write in the native script of ${language}.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini explanation error:", error);
    return null;
  }
};

export const generateVoiceOver = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("Gemini TTS error:", error);
    return null;
  }
};

export const getAIRecommendations = async (history: string[], currentLanguage: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on the user's movie history: ${history.join(', ')}. 
      Suggest 3-5 sub-genres or themes within Horror, Crime, Thriller, and Mystery that this user might like. 
      Respond strictly in the ${currentLanguage} language script.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini recommendation error:", error);
    return null;
  }
};
