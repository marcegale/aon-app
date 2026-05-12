import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export const SUPPORTED_CV_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export function isSupportedCvAttachment(fileName?: string | null, mimeType?: string | null) {
  const normalizedName = fileName?.toLowerCase() ?? "";
  const normalizedMime = mimeType?.toLowerCase() ?? "";

  return (
    SUPPORTED_CV_MIME_TYPES.has(normalizedMime) ||
    normalizedName.endsWith(".pdf") ||
    normalizedName.endsWith(".docx")
  );
}

export async function extractCvText(input: {
  buffer: Buffer;
  fileName?: string | null;
  mimeType?: string | null;
}) {
  const fileName = input.fileName?.toLowerCase() ?? "";
  const mimeType = input.mimeType?.toLowerCase() ?? "";

  if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
    const parser = new PDFParse({ data: input.buffer });
    try {
      const parsed = await parser.getText();
      return parsed.text.trim();
    } finally {
      await parser.destroy();
    }
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx")
  ) {
    const parsed = await mammoth.extractRawText({ buffer: input.buffer });
    return parsed.value.trim();
  }

  throw new Error(`Unsupported CV attachment type: ${mimeType || fileName || "unknown"}`);
}
