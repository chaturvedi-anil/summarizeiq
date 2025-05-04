"use server";

import { generateSummaryFromGemini } from "@/lib/geminiai";
import { fetchAndExtractPdfText } from "@/lib/langchain";
import { generateSummaryFromOpenAI } from "@/lib/openai";

export async function generatePdfSummary(
  uploadResponse: [
    {
      serverData: {
        userId: string;
        file: {
          url: string;
          name: string;
        };
      };
    }
  ]
) {
  if (!uploadResponse) {
    return {
      success: false,
      messsage: "File upload failed",
      data: null,
    };
  }

  const {
    serverData: {
      userId,
      file: { url: pdfUrl, name: fileName },
    },
  } = uploadResponse[0];

  if (!pdfUrl) {
    return {
      success: false,
      messsage: "File upload failed",
      data: null,
    };
  }

  try {
    const pdfText = await fetchAndExtractPdfText(pdfUrl);

    let summary;
    try {
      console.log("try block summary handle");

      summary = await generateSummaryFromOpenAI(pdfText);
      return {
        success: true,
        messsage: "PDF summary generated successfully!",
        data: { summary },
      };
    } catch (error) {
      console.log("Error in OpenAI : ", error);

      if (error) {
        try {
          summary = await generateSummaryFromGemini(pdfText);
        } catch (geminiError) {
          console.error("geminiError : ", geminiError);
          throw new Error(
            "Failed to generate summary with available AI providers"
          );
        }
      }
    }

    if (!summary) {
      return {
        success: false,
        messsage: "Failed to generate summary!",
        data: null,
      };
    }

    return {
      success: true,
      messsage: "Summary generated successfully!",
      data: {
        summary: summary,
      },
    };
  } catch (error) {
    return {
      success: false,
      messsage: "File upload failed",
      data: null,
    };
  }
}
