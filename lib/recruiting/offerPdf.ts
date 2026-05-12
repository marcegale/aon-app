import PDFDocument from "pdfkit";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const BUCKET = "recruiting-offers";
const SIGNED_OFFER_TTL_SECONDS = 60 * 60 * 24;

async function ensurePrivateBucket() {
  const supabase = createSupabaseAdminClient();
  const { error: getError } = await supabase.storage.getBucket(BUCKET);

  if (!getError) {
    return supabase;
  }

  const { error: createError } = await supabase.storage.createBucket(BUCKET, {
    public: false,
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw new Error(`Supabase offer bucket setup failed: ${createError.message}`);
  }

  return supabase;
}

function renderPdf(input: { title: string; content: string; summary?: string | null }) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 56 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).text(input.title, { underline: true });
    doc.moveDown();
    if (input.summary) {
      doc.fontSize(11).fillColor("#555555").text(input.summary);
      doc.moveDown();
    }
    doc.fontSize(11).fillColor("#111111").text(input.content, {
      lineGap: 5,
      align: "left",
    });
    doc.end();
  });
}

export async function generateOfferPdf(input: {
  tenantId: string;
  searchId: string;
  offerId: string;
  candidateId: string;
  generatedContent: string;
  aiSummary?: string | null;
}) {
  const buffer = await renderPdf({
    title: "Oferta laboral",
    content: input.generatedContent,
    summary: input.aiSummary,
  });
  const supabase = await ensurePrivateBucket();
  const storagePath = `${input.tenantId}/${input.searchId}/${input.candidateId}/${input.offerId}/offer.pdf`;
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (error) {
    throw new Error(`Offer PDF upload failed: ${error.message}`);
  }

  const { data, error: signedError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_OFFER_TTL_SECONDS);

  if (signedError || !data?.signedUrl) {
    throw new Error(`Offer signed URL failed: ${signedError?.message ?? "missing URL"}`);
  }

  console.info("offer.pdf.generated", { offerId: input.offerId, storagePath });
  return { bucket: BUCKET, storagePath, signedUrl: data.signedUrl };
}

export async function generateOfferSummaryPdf(input: {
  tenantId: string;
  searchId: string;
  offerId: string;
  candidateId: string;
  summary: string;
}) {
  const buffer = await renderPdf({
    title: "Resumen de oferta",
    content: input.summary,
  });
  const supabase = await ensurePrivateBucket();
  const storagePath = `${input.tenantId}/${input.searchId}/${input.candidateId}/${input.offerId}/summary.pdf`;
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (error) {
    throw new Error(`Offer summary PDF upload failed: ${error.message}`);
  }

  return { bucket: BUCKET, storagePath };
}
