"use client";

import { use } from "react";
import AssessmentClient from "@/components/assessment/assessment-client";

export default function DiagnosticoPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = use(params);

  return (
    <div className="min-h-screen bg-[#183A37] text-white">
      <AssessmentClient tenantSlug={tenantSlug} />
    </div>
  );
}
