import { createSupabaseAdminClient } from "@/lib/supabase/server";

const REQUIRED_BUCKETS = [
  "recruiting-cvs",
  "recruiting-interviews",
  "recruiting-offers",
] as const;

export async function checkRecruitingStorageBuckets() {
  try {
    const supabase = createSupabaseAdminClient();
    const buckets = await Promise.all(
      REQUIRED_BUCKETS.map(async (bucket) => {
        const { error } = await supabase.storage.getBucket(bucket);
        return {
          bucket,
          ok: !error,
          warning: error ? `${bucket} is not accessible or does not exist.` : null,
        };
      }),
    );
    const warnings = buckets.flatMap((bucket) => (bucket.warning ? [bucket.warning] : []));
    return { ready: warnings.length === 0, buckets, warnings };
  } catch (error) {
    return {
      ready: false,
      buckets: REQUIRED_BUCKETS.map((bucket) => ({
        bucket,
        ok: false,
        warning: "Supabase storage health check could not run.",
      })),
      warnings: [error instanceof Error ? error.message : "Storage health check failed."],
    };
  }
}
