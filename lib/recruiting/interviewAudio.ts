import { createSupabaseAdminClient } from "@/lib/supabase/server";

const BUCKET = "recruiting-interviews";
const SIGNED_AUDIO_TTL_SECONDS = 60 * 15;

export const ALLOWED_INTERVIEW_AUDIO_TYPES = new Map([
  ["audio/webm", "webm"],
  ["audio/mpeg", "mp3"],
  ["audio/mp3", "mp3"],
  ["audio/wav", "wav"],
  ["audio/x-wav", "wav"],
  ["audio/mp4", "m4a"],
  ["audio/x-m4a", "m4a"],
]);

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
    throw new Error(`Supabase interview bucket setup failed: ${createError.message}`);
  }

  return supabase;
}

export function generateInterviewAudioPath(input: {
  tenantId: string;
  searchId: string;
  sessionId: string;
  questionId: string;
  extension?: string;
}) {
  return `${input.tenantId}/${input.searchId}/${input.sessionId}/${input.questionId}/audio.${
    input.extension ?? "webm"
  }`;
}

export async function uploadInterviewAudio(input: {
  tenantId: string;
  searchId: string;
  sessionId: string;
  questionId: string;
  mimeType: string;
  buffer: Buffer;
}) {
  const supabase = await ensurePrivateBucket();
  const extension = ALLOWED_INTERVIEW_AUDIO_TYPES.get(input.mimeType) ?? "webm";
  const storagePath = generateInterviewAudioPath({ ...input, extension });

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, input.buffer, {
    contentType: input.mimeType,
    upsert: true,
  });

  if (error) {
    throw new Error(`Interview audio upload failed: ${error.message}`);
  }

  return {
    bucket: BUCKET,
    storagePath,
  };
}

export async function getSignedInterviewAudioUrl(storagePath: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_AUDIO_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    throw new Error(`Interview audio signed URL failed: ${error?.message ?? "missing URL"}`);
  }

  return data.signedUrl;
}
