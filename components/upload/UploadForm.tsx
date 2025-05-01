"use client";

import React from "react";
import { z } from "zod";
import { useUploadThing } from "@/utils/uploadthing";
import UploadFormInput from "./UploadFormInput";
import { error, log } from "console";

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
      console.log("uploaded successfully!");
    },
    onUploadError: (error) => {
      console.log("error occurred while uploading : ", error);
    },
    onUploadBegin: ({ file }) => {
      console.log("upload has begun for", file);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("submitted");
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    // Validation the fields
    // schema with zod
    const validatedFields = schema.safeParse({ file });
    console.log("validatedFields : ", validatedFields);

    if (!validatedFields.success) {
      alert(
        `${
          validatedFields.error.flatten().fieldErrors.file?.[0] ??
          "Invalid file"
        }`
      );
      return;
    }
    // upload the file to uploadthink

    const resp = await startUpload([file]);

    if (!resp) {
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
