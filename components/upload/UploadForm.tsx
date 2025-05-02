"use client";

import React from "react";
import { z } from "zod";
import { useUploadThing } from "@/utils/uploadthing";
import UploadFormInput from "./UploadFormInput";
import { toast } from "sonner";

const schema = z.object({
  file: z
    .instanceof(File, { message: "Invalind file" })
    .refine((file) => file.size <= 20 * 1024 * 1024, {
      message: "File size must be less than 20MB",
    })
    .refine(
      (file) => file.type.startsWith("application/pdf"),
      "File must be a PDF"
    ),
});

export default function UploadForm() {
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
      toast.info(`Uploading ${file}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

      return;
    }

    toast.info("Processing PDF", {
      description: "Hang tight! Our AI is reading through your document! ",
    });
    // upload the file to uploadthink

    const resp = await startUpload([file]);

    if (!resp) {
      toast.error("Something went wrong!", {
        description: "Please use different file1!",
      });
      return;
    }

    // parse the pdf using langchain
    // summarize the pdf using ai
    // save the summary to the database
    // re direct to the[id] summary page
  };
  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
      <UploadFormInput onSubmit={handleSubmit} />
    </div>
  );
}
