"use client";

import React from "react";
import { z } from "zod";
import UploadFormInput from "./UploadFormInput";

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
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("submitted");
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    // Validation the fields
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
    // schema with zod
    // upload the file to uploadthink
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
