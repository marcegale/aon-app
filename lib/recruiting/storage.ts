import { createSupabaseAdminClient } from "@/lib/supabase/server";

const DEFAULT_BUCKET = "recruiting-cvs";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7;

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function getRecruitingCvBucket() {
  return process.env.RECRUITING_CV_BUCKET || DEFAULT_BUCKET;
}

async function ensurePrivateBucket(supabase: ReturnType<typeof createSupabaseAdminClient>, bucket: string) {
  const { error: getError } = await supabase.storage.getBucket(bucket);

  if (!getError) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(bucket, {
    public: false,
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw new Error(`Supabase bucket setup failed: ${createError.message}`);
  }
}

export async function uploadRecruitingCv(input: {
  tenantId: string;
  searchId: string;
  candidateKey: string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}) {
  const supabase = createSupabaseAdminClient();
  const bucket = getRecruitingCvBucket();
  const safeFileName = sanitizeFileName(input.fileName || "cv");
  const storagePath = `${input.tenantId}/${input.searchId}/${input.candidateKey}/${Date.now()}-${safeFileName}`;

  await ensurePrivateBucket(supabase, bucket);

  const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, input.buffer, {
    contentType: input.mimeType || "application/octet-stream",
    upsert: false,
  });

  if (uploadError) {
    throw new Error(`Supabase CV upload failed: ${uploadError.message}`);
  }

  const { data, error: signedUrlError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (signedUrlError || !data?.signedUrl) {
    throw new Error(`Supabase signed URL failed: ${signedUrlError?.message ?? "missing signed URL"}`);
  }

  return {
    bucket,
    storagePath,
    signedUrl: data.signedUrl,
  };
}
