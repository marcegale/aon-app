import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authClient = await createServerSupabaseClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("invoice_batches")
      .select("id, client, date, total, validated, items, created_at")
      .eq("user_id", user.id)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Lote no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ batch: data });
  } catch {
    return NextResponse.json({ error: "Error inesperado" }, { status: 500 });
  }
}
