import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, facturaId } = body;

    if (!userId || !facturaId) {
      return NextResponse.json(
        { error: "Missing userId or facturaId" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const { data: existing, error: existingError } = await supabase
      .from("usage_tracking")
      .select("id")
      .eq("user_id", userId)
      .eq("factura_id", facturaId)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: "Usage lookup failed", details: existingError.message },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json({ success: true, duplicated: true });
    }

    const { error } = await supabase.from("usage_tracking").insert({
      user_id: userId,
      factura_id: facturaId,
      event_type: "invoice_validated",
    });

    if (error) {
      return NextResponse.json(
        { error: "Usage tracking failed", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, duplicated: false });
  } catch (error) {
    console.error("USAGE TRACK ERROR:", error);

    return NextResponse.json(
      { error: "Unexpected tracking error" },
      { status: 500 }
    );
  }
}