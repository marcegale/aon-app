import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const DEFAULT_MONTHLY_LIMIT = 20;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: limitRow, error: limitError } = await supabase
      .from("usage_limits")
      .select("monthly_limit,is_blocked")
      .eq("user_id", userId)
      .maybeSingle();

    if (limitError) {
      return NextResponse.json(
        { error: "Limit check failed", details: limitError.message },
        { status: 500 }
      );
    }

    const monthlyLimit = limitRow?.monthly_limit ?? DEFAULT_MONTHLY_LIMIT;
    const isBlocked = limitRow?.is_blocked ?? false;

    const { count, error: countError } = await supabase
      .from("usage_tracking")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString());

    if (countError) {
      return NextResponse.json(
        { error: "Usage count failed", details: countError.message },
        { status: 500 }
      );
    }

    const used = count ?? 0;
    const remaining = Math.max(monthlyLimit - used, 0);
    const limitReached = isBlocked || used >= monthlyLimit;

    return NextResponse.json({
      userId,
      used,
      monthlyLimit,
      remaining,
      isBlocked,
      limitReached,
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected usage check error" },
      { status: 500 }
    );
  }
}