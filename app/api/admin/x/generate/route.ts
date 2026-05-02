import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-auth";
import { generateOptions } from "@/lib/x-agent/generate";

async function requireAdmin() {
  const authClient = await createServerSupabaseClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") return null;
  return user;
}

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { topic } = await req.json();
  if (!topic?.trim()) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }

  try {
    const options = await generateOptions(topic);
    return NextResponse.json({ options });
  } catch {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
