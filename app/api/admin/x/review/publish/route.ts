import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { verifyApprovalToken } from "@/lib/x-agent/email";
import { TwitterApi } from "twitter-api-v2";

async function requireAdmin() {
  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") return null;
  return user;
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { postId, queueId, selectedOptionKey, finalText, imageUrl, token } = body as {
    postId?: string;
    queueId?: string | null;
    selectedOptionKey?: string;
    finalText?: string;
    imageUrl?: string | null;
    token?: string;
  };

  if (!postId || !token) {
    return NextResponse.json({ error: "Missing postId or token" }, { status: 400 });
  }

  if (!verifyApprovalToken(postId, token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  if (!finalText?.trim()) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  if (finalText.length > 280) {
    return NextResponse.json({ error: "Text exceeds 280 characters" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: post } = await supabase.from("x_posts").select("id, status").eq("id", postId).single();

  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  if (post.status === "published") {
    return NextResponse.json({ error: "Already published" }, { status: 409 });
  }

  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return NextResponse.json({ error: "Twitter API credentials not configured" }, { status: 500 });
  }

  // Update post content + image before publishing
  await supabase
    .from("x_posts")
    .update({ content: finalText, image_url: imageUrl ?? null })
    .eq("id", postId);

  try {
    const client = new TwitterApi({ appKey: apiKey, appSecret: apiSecret, accessToken, accessSecret });

    let mediaIds: [string] | undefined;
    if (imageUrl) {
      const imgRes = await fetch(imageUrl);
      if (imgRes.ok) {
        const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
        const mimeType = (imgRes.headers.get("content-type") ?? "image/png").split(";")[0];
        const mediaId = await client.v1.uploadMedia(imgBuffer, { mimeType });
        mediaIds = [mediaId];
      }
    }

    if (mediaIds) {
      await client.v2.tweet({ text: finalText, media: { media_ids: mediaIds } });
    } else {
      await client.v2.tweet(finalText);
    }

    await supabase
      .from("x_posts")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", postId);

    if (queueId) {
      await supabase
        .from("x_agent_queue")
        .update({ status: "published", selected_option: { label: selectedOptionKey } })
        .eq("id", queueId);
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await supabase
      .from("x_posts")
      .update({ status: "failed", error_message: msg })
      .eq("id", postId);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
