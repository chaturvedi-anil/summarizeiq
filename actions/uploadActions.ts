"use server";

import { getDbConnection } from "@/lib/db";
import { generateSummaryFromGemini } from "@/lib/geminiai";
import { fetchAndExtractPdfText } from "@/lib/langchain";
import { generateSummaryFromOpenAI } from "@/lib/openai";
import { formatFileNameAsTitle } from "@/utils/formatUtils";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type PDFSummaryType = {
  userId?: string;
  fileUrl: string;
  summary: string;
  title: string;
  fileName: string;
};

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
      message: "File upload failed",
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
      summary = await generateSummaryFromOpenAI(pdfText);
      return {
        success: true,
        messsage: "PDF summary generated successfully!",
        data: { summary },
      };
    } catch (error) {
      console.log("Error in OpenAI : ", error);

      try {
        summary = await generateSummaryFromGemini(pdfText);
      } catch (geminiError) {
        console.error("geminiError : ", geminiError);
        throw new Error(
          "Failed to generate summary with available AI providers"
        );
      }
    }

    if (!summary) {
      return {
        success: false,
        message: "Failed to generate summary!",
        data: null,
      };
    }

    const formattedFileName = formatFileNameAsTitle(fileName);
    return {
      success: true,
      message: "Summary generated successfully!",
      data: {
        title: formattedFileName,
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

export async function savePdfSummary({
  userId,
  fileUrl,
  summary,
  title,
  fileName,
}: PDFSummaryType) {
  try {
    const sql = await getDbConnection();
    const result = await sql`
      INSERT INTO pdf_summaries (
        user_id,
        original_file_url,
        summary_text,
        title,
        file_name
      ) VALUES (
        ${userId},
        ${fileUrl},
        ${summary},
        ${title},
        ${fileName}
      )
    `;

    return result[0];
  } catch (error: any) {
    console.error("❌ Error saving PDF summary:", error);
    throw new Error("Failed to save PDF summary.");
  }
}
export async function storePdfSummaryAction({
  fileUrl,
  summary,
  title,
  fileName,
}: PDFSummaryType) {
  let savedSummary: any;
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        messsage: "User not found!",
      };
    }

    savedSummary = await savePdfSummary({
      userId,
      fileUrl,
      summary,
      title,
      fileName,
    });

    if (!savedSummary) {
      return {
        success: false,
        message: "Failed to save PDF summary, please try again...",
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Error saving PDF summary",
    };
  }

  revalidatePath(`/summaries/${savedSummary.id}`);
  return {
    success: true,
    message: "PDF summary saved successfully!..",
    data: { id: savedSummary.id },
  };
}
