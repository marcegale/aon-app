import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const authClient = await createServerSupabaseClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") return null;
  return user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("x_agent_settings")
    .select("image_prompt, emails_enabled")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({
    image_prompt: data?.image_prompt ?? "",
    emails_enabled: data?.emails_enabled ?? true,
  });
}

export async function PUT(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const patch: Record<string, unknown> = { user_id: user.id, updated_at: new Date().toISOString() };
  if ("image_prompt" in body) patch.image_prompt = body.image_prompt ?? "";
  if ("emails_enabled" in body) patch.emails_enabled = Boolean(body.emails_enabled);

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("x_agent_settings").upsert(patch);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
