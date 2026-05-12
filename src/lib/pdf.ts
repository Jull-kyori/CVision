import { createRequire } from "module";

type PDFParseResult = {
  text?: string;
};

const require = createRequire(import.meta.url);

const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
  buffer: Buffer
) => Promise<PDFParseResult>;

export async function extractPDFText(buffer: Buffer) {
  const data = await pdfParse(buffer);

  return data.text || "";
}