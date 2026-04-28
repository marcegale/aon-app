import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { userId, amount } = await req.json();

  if (!userId || !amount) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: existing } = await supabase
    .from("usage_limits")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (existing) {
    await supabase
      .from("usage_limits")
      .update({
        monthly_limit: existing.monthly_limit + amount,
      })
      .eq("user_id", userId);
  } else {
    await supabase.from("usage_limits").insert({
      user_id: userId,
      monthly_limit: amount,
      is_blocked: false,
    });
  }

  return NextResponse.json({ success: true });
}