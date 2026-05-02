import { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { verifyApprovalToken } from "@/lib/x-agent/email";
import { TwitterApi } from "twitter-api-v2";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const token = req.nextUrl.searchParams.get("token");
  const optionParam = req.nextUrl.searchParams.get("option");

  if (!id || !token || !verifyApprovalToken(id, token)) {
    return html("Token inválido", "El enlace es inválido o ya fue usado.", false);
  }

  const supabase = createSupabaseAdminClient();

  const { data: post, error: fetchError } = await supabase
    .from("x_posts")
    .select("id, content, image_url, status")
    .eq("id", id)
    .single();

  if (fetchError || !post) {
    return html("Post no encontrado", "El post no existe en la base de datos.", false);
  }

  if (post.status === "published") {
    return html("Ya publicado", "Este post ya fue publicado anteriormente.", true);
  }

  if (post.status === "rejected") {
    return html("Ya rechazado", "Este post fue rechazado y no puede publicarse.", false);
  }

  // Resolve content — if option index provided, load that option from the queue
  let contentToPublish: string = post.content;

  if (optionParam !== null) {
    const optionIndex = parseInt(optionParam, 10);

    if (!isNaN(optionIndex) && optionIndex >= 0) {
      const { data: queueRow } = await supabase
        .from("x_agent_queue")
        .select("id, options")
        .eq("post_id", id)
        .single();

      const options = queueRow?.options as { content: string }[] | null;
      const chosen = options?.[optionIndex];

      if (chosen?.content) {
        contentToPublish = chosen.content;

        // Update post content and queue selected_option before publishing
        await supabase
          .from("x_posts")
          .update({ content: contentToPublish })
          .eq("id", id);

        await supabase
          .from("x_agent_queue")
          .update({ selected_option: chosen })
          .eq("post_id", id);
      }
    }
  }

  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return html("Error de configuración", "Las credenciales de X no están configuradas.", false);
  }

  try {
    const client = new TwitterApi({ appKey: apiKey, appSecret: apiSecret, accessToken, accessSecret });

    let mediaIds: [string] | undefined;
    if (post.image_url) {
      const imgRes = await fetch(post.image_url);
      if (imgRes.ok) {
        const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
        const mimeType = (imgRes.headers.get("content-type") ?? "image/png").split(";")[0];
        const mediaId = await client.v1.uploadMedia(imgBuffer, { mimeType });
        mediaIds = [mediaId];
      }
    }

    if (mediaIds) {
      await client.v2.tweet({ text: contentToPublish, media: { media_ids: mediaIds } });
    } else {
      await client.v2.tweet(contentToPublish);
    }

    await supabase
      .from("x_posts")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", id);

    return html("Publicado", "El post fue publicado en X.", true);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    await supabase
      .from("x_posts")
      .update({ status: "failed", error_message: msg })
      .eq("id", id);
    return html("Error al publicar", msg, false);
  }
}

function html(title: string, body: string, success: boolean) {
  const color = success ? "#16a34a" : "#dc2626";
  const icon = success ? "✓" : "✕";
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
