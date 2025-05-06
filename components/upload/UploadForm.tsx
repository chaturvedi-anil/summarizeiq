"use client";

import React, { useRef, useState } from "react";
import { z } from "zod";
import { useUploadThing } from "@/utils/uploadthing";
import UploadFormInput from "./UploadFormInput";
import { toast } from "sonner";
import {
  generatePdfSummary,
  storePdfSummaryAction,
} from "@/actions/uploadActions";

const schema = z.object({
  file: z
    .instanceof(File, { message: "Invalid file" })
    .refine((file) => file.size <= 20 * 1024 * 1024, {
      message: "File size must be less than 20MB",
    })
    .refine(
      (file) => file.type.startsWith("application/pdf"),
      "File must be a PDF"
    ),
});

export default function UploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { startUpload, routeConfig } = useUploadThing("pdfUploader", {
    onClientUploadComplete: () => {
      toast.success("Uploaded successfully!");
    },
    onUploadError: (error) => {
      toast.error("Error occurred while uploading", {
        description: error.message,
      });
    },
    onUploadBegin: ({ file }) => {
      // toast.info(`Uploading ${file}`)
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const formData = new FormData(e.currentTarget);
      const file = formData.get("file") as File;

      // Validation the fields
      // schema with zod
      const validatedFields = schema.safeParse({ file });

      if (!validatedFields.success) {
        toast.error("Something went wrong", {
          description:
            validatedFields.error.flatten().fieldErrors.file?.[0] ?? "Invalid",
        });
        setIsLoading(false);
        return;
      }

      toast.info("Uploading PDF...", {
        description: "We are uploading your pdf!",
      });
      // upload the file to uploadthink

      const resp = await startUpload([file]);

      if (!resp) {
        toast.error("Something went wrong!", {
          description: "Please use different file1!",
        });
        setIsLoading(false);
        return;
      }

      toast.info("Processing PDF...", {
        description: "Hang tight! Our AI is reading through your document! ",
      });
      // parse the pdf using langchain
      const result = await generatePdfSummary(resp);

      const { data = null, message = null } = result || {};

      if (data) {
        let storeResult: any;
        toast.info("Saving PDF...", {
          description: "Hang tight! We are saving your summary! ",
        });

        if (data.summary) {
          storeResult = await storePdfSummaryAction({
            summary: data.summary,
            fileUrl: resp[0].serverData?.file?.url,
            title: data.title,
            fileName: data.title,
          });
          // save the summary in db

          toast.success("Summary Generated!", {
            description: "Your summary has been saved!",
          });

          // reseting the form
          formRef.current?.reset();
        }
      }
      // summarize the pdf using ai
      // save the summary to the database
      // re direct to the[id] summary page
    } catch (error) {
      setIsLoading(false);
      console.error(`Error occur : `, error);
      formRef.current?.reset();
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      <UploadFormInput
        ref={formRef}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
