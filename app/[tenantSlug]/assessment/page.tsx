import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  verifyTenantSessionToken,
  tenantSessionCookieName,
} from "@/app/lib/tenant-auth";
import AssessmentClient from "@/components/assessment/assessment-client";

export default async function DiagnosticoPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(tenantSessionCookieName(tenantSlug))?.value;

  if (!token) redirect(`/${tenantSlug}/login`);

  try {
    const result = verifyTenantSessionToken(token, tenantSlug);
    if (!result.ok) redirect(`/${tenantSlug}/login`);
  } catch {
    // TENANT_SESSION_SECRET missing — deny access
    redirect(`/${tenantSlug}/login`);
  }

  return (
    <div className="min-h-screen bg-[#183A37] text-white">
      <AssessmentClient tenantSlug={tenantSlug} />
    </div>
  );
}
