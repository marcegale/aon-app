import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rows = body.rows;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "No rows provided" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const { error } = await supabase.from("invoice_items").insert(rows);

    if (error) {
      console.error("SUPABASE INSERT ERROR:", error);
      return NextResponse.json(
        { error: "Insert failed", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      inserted: rows.length,
    });
  } catch (error) {
    console.error("SAVE ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "Unexpected save error" },
      { status: 500 }
    );
  }
}