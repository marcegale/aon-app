import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  verifyTenantSessionToken,
  tenantSessionCookieName,
} from "@/app/lib/tenant-auth";

export default async function TenantEntryPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(tenantSessionCookieName(tenantSlug))?.value;

  if (token) {
    try {
      const result = verifyTenantSessionToken(token, tenantSlug);
      if (result.ok) redirect(`/${tenantSlug}/assessment`);
    } catch {
      // TENANT_SESSION_SECRET missing — fall through to login
    }
  }

  redirect(`/${tenantSlug}/login`);
}
