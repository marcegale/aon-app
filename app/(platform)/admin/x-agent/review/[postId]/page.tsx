import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { verifyApprovalToken } from "@/lib/x-agent/email";
import ReviewClient from "./review-client";

const SLUG_TO_LABEL: Record<string, string> = {
  directo: "Directo",
  emocional: "Emocional",
  analitico: "Analítico",
};

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ postId: string }>;
  searchParams: Promise<{ token?: string; option?: string }>;
}) {
  const { postId } = await params;
  const { token, option } = await searchParams;

  if (!token || !verifyApprovalToken(postId, token)) {
    notFound();
  }

  const supabase = createSupabaseAdminClient();

  const { data: post } = await supabase
    .from("x_posts")
    .select("id, content, image_url, status")
    .eq("id", postId)
    .single();

  if (!post) notFound();

  if (post.status === "published") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0D12]">
        <div className="text-center">
          <p className="text-2xl">✓</p>
          <h1 className="mt-2 text-lg font-bold text-white">Ya publicado</h1>
          <p className="mt-1 text-sm text-white/50">Este post ya fue publicado anteriormente.</p>
        </div>
      </div>
    );
  }

  if (post.status === "rejected") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0D12]">
        <div className="text-center">
          <p className="text-2xl">✕</p>
          <h1 className="mt-2 text-lg font-bold text-white">Rechazado</h1>
          <p className="mt-1 text-sm text-white/50">Este post fue rechazado y no puede publicarse.</p>
        </div>
      </div>
    );
  }

  const { data: queueRow } = await supabase
    .from("x_agent_queue")
    .select("id, options")
    .eq("post_id", postId)
    .single();

  const options = (queueRow?.options ?? []) as { label: string; content: string }[];
  const optionSlug = option ?? "directo";
  const optionLabel = SLUG_TO_LABEL[optionSlug] ?? "Directo";
  const matchedOption = options.find((o) => o.label === optionLabel);
  const initialText = matchedOption?.content ?? post.content;

  return (
    <ReviewClient
      postId={postId}
      queueId={queueRow?.id ?? null}
      selectedOptionKey={optionSlug}
      initialText={initialText}
      optionLabel={optionLabel}
      token={token}
    />
  );
}
