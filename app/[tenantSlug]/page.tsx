"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function TenantEntryPage() {
  const params = useParams<{ tenantSlug: string }>();
  const tenantSlug = params.tenantSlug;

  useEffect(() => {
    const hasAuth = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`tenant_auth_${tenantSlug}=`));

    if (hasAuth) {
      window.location.replace(`/${tenantSlug}/assessment`);
    } else {
      window.location.replace(`/${tenantSlug}/login`);
    }
  }, []);

  return null;
}