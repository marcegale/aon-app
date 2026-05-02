import { Resend } from "resend";
import { createHmac, timingSafeEqual } from "crypto";
import type { NormalizedOption } from "./generate";

// ── Config validation ─────────────────────────────────────────────────────────

const WEAK_SECRETS = new Set([
  "dev-secret-change-me",
  "change-me-to-a-random-secret",
  "secret",
  "changeme",
  "",
]);

function getApprovalSecret(): string {
  const secret = process.env.X_APPROVAL_SECRET;
  if (!secret) throw new Error("Missing env var: X_APPROVAL_SECRET");
  if (WEAK_SECRETS.has(secret) || secret.length < 20) {
    throw new Error(
      "X_APPROVAL_SECRET is insecure — set a random string of at least 20 characters (e.g. openssl rand -hex 32)"
    );
  }
  return secret;
}

function getAppUrl(): string {
  const url = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (!url) throw new Error("Missing env var: APP_URL or NEXT_PUBLIC_APP_URL");
  return url.replace(/\/$/, "");
}

function validateEmailConfig(): { apiKey: string; to: string; from: string } {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Missing env var: RESEND_API_KEY");

  const to = process.env.ADMIN_EMAILS;
  if (!to) throw new Error("Missing env var: ADMIN_EMAILS");

  const from = process.env.RESEND_FROM_EMAIL ?? process.env.EMAIL_FROM;
  if (!from) throw new Error("Missing env var: RESEND_FROM_EMAIL or EMAIL_FROM");

  return { apiKey, to, from };
}

// ── Token ─────────────────────────────────────────────────────────────────────

export function makeApprovalToken(postId: string): string {
  // Uses the validated secret — throws if misconfigured
  const secret = getApprovalSecret();
  return createHmac("sha256", secret).update(postId).digest("hex");
}

export function verifyApprovalToken(postId: string, token: string): boolean {
  try {
    const expected = makeApprovalToken(postId);
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(token, "hex"));
  } catch {
    return false;
  }
}

// ── Email ─────────────────────────────────────────────────────────────────────

export async function sendApprovalEmail(
  post: { id: string; content: string },
  options: NormalizedOption[]
): Promise<void> {
  const { apiKey, to, from } = validateEmailConfig();
  const appUrl = getAppUrl();
  const token = makeApprovalToken(post.id);

  const LABEL_TO_SLUG: Record<string, string> = {
    "Directo": "directo",
    "Emocional": "emocional",
    "Analítico": "analitico",
  };
  const approveUrls = options.map((opt, i) => {
    const slug = LABEL_TO_SLUG[opt.label] ?? `option${i}`;
    return `${appUrl}/admin/x-agent/review/${post.id}?option=${slug}&token=${token}`;
  });
  const rejectUrl = `${appUrl}/api/admin/x/reject?id=${post.id}&token=${token}`;

  console.log("EMAIL → sending", { postId: post.id, to, from });

  const resend = new Resend(apiKey);
  try {
    const sendResult = await resend.emails.send({
      from,
      to,
      subject: "[X Agent] Nuevo post listo para aprobación",
      html: buildHtml({ options, approveUrls, rejectUrl }),
    });
    console.log("EMAIL → sent response", sendResult);
  } catch (err: unknown) {
    console.error("EMAIL → failed", err);
    throw err;
  }
}

// ── HTML builder ─────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml({
  options,
  approveUrls,
  rejectUrl,
}: {
  options: NormalizedOption[];
  approveUrls: string[];
  rejectUrl: string;
}): string {
  const optionsHtml = options
    .map(
      (opt, i) => `
      <tr>
        <td style="padding:16px 0;border-bottom:1px solid #1a1a1a;">
          <div style="margin-bottom:8px;">
            <span style="background:#1a1a1a;border:1px solid #333;color:#C9A24D;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:2px 8px;border-radius:4px;">${esc(opt.label)}</span>
            <span style="margin-left:6px;color:#555;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;">${esc(opt.tone)} · ${esc(opt.content_type)}</span>
          </div>
          <p style="margin:0 0 12px;color:#ddd;font-size:14px;line-height:1.6;">${esc(opt.content)}</p>
          <a href="${approveUrls[i]}" style="display:inline-block;background:#16a34a;color:#fff;font-size:12px;font-weight:700;text-decoration:none;padding:8px 20px;border-radius:6px;letter-spacing:0.02em;">
            Revisar y publicar
          </a>
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0B0D12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0D12;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#C9A24D;">X Agent</p>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#fff;line-height:1.3;">Elegí qué publicar</h1>
            </td>
          </tr>

          <!-- Options -->
          <tr>
            <td style="background:#0e1219;border:1px solid #1a2030;border-radius:12px;padding:20px;">
              <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#555;">3 opciones generadas</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${optionsHtml}
              </table>
            </td>
          </tr>

          <tr><td style="height:20px;"></td></tr>

          <!-- Reject -->
          <tr>
            <td>
              <a href="${rejectUrl}" style="display:inline-block;background:#1a1a1a;border:1px solid #333;color:#888;font-size:13px;font-weight:600;text-decoration:none;padding:10px 24px;border-radius:8px;letter-spacing:0.02em;">
                Rechazar todas
              </a>
            </td>
          </tr>

          <tr><td style="height:32px;"></td></tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #1a1a1a;padding-top:16px;">
              <p style="margin:0;font-size:11px;color:#444;line-height:1.5;">
                Cada botón publica directamente en X con el contenido de esa opción.<br>
                Si ya fue procesado, verás una confirmación.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
