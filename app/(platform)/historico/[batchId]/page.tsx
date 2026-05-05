import { redirect } from "next/navigation";

export default async function LegacyBatchDetailPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  redirect(`/agents/accounting/invoice-processor/historico/${batchId}`);
}
