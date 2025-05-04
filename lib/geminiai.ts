import { SUMMARY_SYSTEM_PROMPT } from "@/utils/prompts";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
export const generateSummaryFromGemini = async (pdfText: string) => {
  try {
    const model = await genAi.getGenerativeModel({
      model: "gemini-2.0-flash-001",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      },
    });

    const prompt = {
      contents: [
        {
          role: "user",
          parts: [
            { text: SUMMARY_SYSTEM_PROMPT },
            {
              text: `Transform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting:\n\n${pdfText}`,
            },
          ],
        },
      ],
    };
    const result = await model.generateContent(prompt);
    console.log("gemini model result : ", result);

    const response = await result.response;

    if (!response.text()) {
      throw new Error("Empty response from Gemini API");
    }
    console.log("gemini Respones : ", response);

    return response.text();
  } catch (error: any) {
    console.error("Gemini error:", error);

    throw error;
  }
};
