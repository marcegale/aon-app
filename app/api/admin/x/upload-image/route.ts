import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const authClient = await createServerSupabaseClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") return null;
  return user;
}

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  const supabase = createSupabaseAdminClient();
  await supabase.storage.createBucket("x-agent-images", { public: true });

  const storagePath = `composed/${crypto.randomUUID()}.png`;
  const { error: uploadError } = await supabase.storage
    .from("x-agent-images")
    .upload(storagePath, buffer, { contentType: "image/png", upsert: false });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data } = supabase.storage.from("x-agent-images").getPublicUrl(storagePath);
  return NextResponse.json({ image_url: data.publicUrl });
}
