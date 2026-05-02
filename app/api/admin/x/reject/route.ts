import { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { verifyApprovalToken } from "@/lib/x-agent/email";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const token = req.nextUrl.searchParams.get("token");

  if (!id || !token || !verifyApprovalToken(id, token)) {
    return html("Token inválido", "El enlace es inválido o ya fue usado.", false);
  }

  const supabase = createSupabaseAdminClient();

  const { data: post, error: fetchError } = await supabase
    .from("x_posts")
    .select("id, status")
    .eq("id", id)
    .single();

  if (fetchError || !post) {
    return html("Post no encontrado", "El post no existe en la base de datos.", false);
  }

  if (post.status === "published") {
    return html("Ya publicado", "Este post ya fue publicado y no puede rechazarse.", false);
  }

  if (post.status === "rejected") {
    return html("Ya rechazado", "Este post ya había sido rechazado.", true);
  }

  const { error } = await supabase
    .from("x_posts")
    .update({ status: "rejected" })
    .eq("id", id);

  if (error) {
    return html("Error", error.message, false);
  }

  return html("Rechazado", "El post fue rechazado y no se publicará.", true);
}

function html(title: string, body: string, success: boolean) {
  const color = success ? "#C9A24D" : "#dc2626";
  const icon = success ? "✕" : "!";
  return new Response(
    `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:40px 20px;background:#0B0D12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;box-sizing:border-box;">
  <div style="max-width:420px;width:100%;text-align:center;">
    <div style="width:56px;height:56px;border-radius:50%;background:${color}22;border:2px solid ${color};display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:22px;color:${color};">${icon}</div>
    <h1 style="margin:0 0 8px;color:#fff;font-size:20px;font-weight:700;">${title}</h1>
    <p style="margin:0;color:#888;font-size:14px;line-height:1.5;">${body}</p>
  </div>
</body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
