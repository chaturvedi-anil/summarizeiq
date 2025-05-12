// Import the system prompt constant used to guide the summarization behavior
import { SUMMARY_SYSTEM_PROMPT } from "@/utils/prompts";

// Import the OpenAI SDK for accessing the API
import OpenAI from "openai";

// Create an instance of the OpenAI client with the API key from environment variables
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define an asynchronous function to generate a summary from OpenAI using the chat completion API
export async function generateSummaryFromOpenAI(pdfText: string) {
  try {
    // Call the OpenAI Chat API with model and message configuration
    const response = await client.chat.completions.create({
      model: "gpt-4", // Use the GPT-4 model for better summarization
      messages: [
        { role: "system", content: SUMMARY_SYSTEM_PROMPT }, // System message to guide AI behavior
        {
          role: "user",
          content: `Transform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting:\n\n${pdfText}`, // User message with input text
        },
      ],
      temperature: 0.7, // Controls creativity level of response (0 = deterministic, 1 = creative)
      max_tokens: 1500, // Maximum number of tokens (words/punctuation) in the response
    });

    // Return the generated summary or a fallback message if none was returned
    return response.choices[0]?.message?.content ?? "No summary generated";
  } catch (error: any) {
    // Log any error encountered during API call
    console.error("OpenAI error:", error);

    // If the error is due to rate limiting, throw a specific error
    if (error?.status === 429) {
      throw new Error("RATE_LIMIT_EXCEEDED");
    }

    // For all other errors, throw a general internal error
    throw new Error("INTERNAL_ERROR");
  }
}