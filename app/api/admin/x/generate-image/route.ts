import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import OpenAI from "openai";

async function requireAdmin() {
  const authClient = await createServerSupabaseClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") return null;
  return user;
}

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: settings } = await supabase
    .from("x_agent_settings")
    .select("image_prompt")
    .eq("user_id", user.id)
    .single();

  const basePrompt = settings?.image_prompt?.trim() ||
    "Cinematic wide-angle sports venue photograph. Photorealistic broadcast quality. Dramatic stadium atmosphere, premium lighting.";

  const fullPrompt = `${basePrompt}

Use the following tweet context to determine the sport and choose the matching venue (football stadium, tennis court, F1 circuit, basketball arena, etc.):
${content.trim()}

Requirements: clean background only, open composition with a darker lower section for text overlay, dramatic broadcast-quality lighting, wide establishing shot.
Hard restrictions: no text of any kind, no scoreboards, no logos, no team crests, no real athlete faces, no abstract or painted effects, no fantasy elements, no watermarks.`;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: fullPrompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
  });

  const tmpUrl = response.data[0]?.url;
  if (!tmpUrl) {
    return NextResponse.json({ error: "No image returned" }, { status: 500 });
  }

  const imageRes = await fetch(tmpUrl);
  if (!imageRes.ok) {
    return NextResponse.json({ error: "Failed to download generated image" }, { status: 500 });
  }
  const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

  const BUCKET = "x-agent-images";
  await supabase.storage.createBucket(BUCKET, { public: true });

  const storagePath = `posts/${crypto.randomUUID()}.png`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, imageBuffer, { contentType: "image/png", upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  return NextResponse.json({ image_url: publicUrlData.publicUrl });
}
