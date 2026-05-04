import { createServerSupabaseClient } from "@/lib/supabase/server-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type CronUser = { id: string };

// Cached after first successful resolution to avoid listUsers on every cron hit.
let _cronAdminId: string | null = null;

async function resolveAdminId(): Promise<string | null> {
  if (_cronAdminId) return _cronAdminId;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.auth.admin.listUsers({ perPage: 100 });
  const admin = data?.users?.find((u) => u.app_metadata?.role === "admin");
  if (!admin) return null;
  _cronAdminId = admin.id;
  return _cronAdminId;
}

/**
 * Allows access via two paths:
 *   1. Valid Bearer token matching X_AGENT_CRON_SECRET header → resolves to the admin user ID.
 *   2. Logged-in admin session (existing behavior).
 *
 * Returns null (→ 403) if neither condition is met, or if a token is present but wrong.
 */
export async function requireAdminOrCron(req: Request): Promise<CronUser | null> {
  const authHeader = req.headers.get("Authorization");

  if (authHeader) {
    const cronSecret = process.env.X_AGENT_CRON_SECRET;
    // Never accept cron if secret is not configured or empty.
    if (cronSecret) {
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
      if (token && token === cronSecret) {
        const adminId = await resolveAdminId();
        return adminId ? { id: adminId } : null;
      }
    }
    // Token present but invalid → fall through to session check (spec: "seguir con auth admin actual").
  }

  // Session-based admin check — unchanged from original requireAdmin().
  const authClient = await createServerSupabaseClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") return null;
  return user;
}
