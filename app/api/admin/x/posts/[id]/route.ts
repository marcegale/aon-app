import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { TwitterApi } from "twitter-api-v2";

async function requireAdmin() {
  const authClient = await createServerSupabaseClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") return null;
  return user;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const supabase = createSupabaseAdminClient();

  // Publish now action
  if (body.action === "publish") {
    const apiKey = process.env.X_API_KEY;
    const apiSecret = process.env.X_API_SECRET;
    const accessToken = process.env.X_ACCESS_TOKEN;
    const accessSecret = process.env.X_ACCESS_SECRET;

    if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
      return NextResponse.json({ error: "Twitter API credentials not configured" }, { status: 400 });
    }

    const { data: post } = await supabase
      .from("x_posts")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    try {
      const client = new TwitterApi({ appKey: apiKey, appSecret: apiSecret, accessToken, accessSecret });

      let mediaIds: [string] | undefined;
      if (post.image_url) {
        const imgRes = await fetch(post.image_url);
        if (imgRes.ok) {
          const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
          const mimeType = (imgRes.headers.get("content-type") ?? "image/png").split(";")[0];
          const mediaId = await client.v1.uploadMedia(imgBuffer, { mimeType });
          mediaIds = [mediaId];
        }
      }

      await client.v2.tweet(
        mediaIds
          ? { text: post.content, media: { media_ids: mediaIds } }
          : post.content
      );

      const { data: updated } = await supabase
        .from("x_posts")
        .update({ status: "published", published_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      return NextResponse.json({ post: updated });
    } catch (err: any) {
      await supabase
        .from("x_posts")
        .update({ status: "failed", error_message: err.message })
        .eq("id", id);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // Reject action
  if (body.action === "reject") {
    const { data, error } = await supabase
      .from("x_posts")
      .update({ status: "rejected" })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ post: data });
  }

  // Generic update (content, scheduled_at, status, etc.)
  const { data, error } = await supabase
    .from("x_posts")
    .update(body)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("x_posts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
