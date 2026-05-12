import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { OfferResponseForm } from "./OfferResponseForm";

export default async function OfferPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const offer = await prisma.recruitingOffer.findUnique({
    where: { publicToken: token },
    include: {
      candidate: { select: { fullName: true } },
      search: { select: { title: true } },
      versions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!offer) notFound();
  const version = offer.versions[0];
  const expired = Boolean(offer.expiresAt && offer.expiresAt < new Date());
  const closed = ["accepted", "rejected", "expired"].includes(offer.status) || expired;

  return (
    <main className="min-h-screen bg-[#071413] px-6 py-10 text-white">
      <section className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#0F2422] p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-[#C96F3B]">Offer</p>
        <h1 className="mt-2 text-3xl font-semibold">{offer.search.title}</h1>
        <p className="mt-2 text-sm text-white/60">
          {offer.candidate.fullName ?? "Candidato"} · Status: {expired ? "expired" : offer.status}
        </p>
        {version ? (
          <article className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-white/50">{version.aiSummary}</p>
            <pre className="mt-4 whitespace-pre-wrap text-sm leading-6 text-white/75">
              {version.generatedContent}
            </pre>
          </article>
        ) : (
          <p className="mt-6 text-sm text-white/50">Oferta sin version disponible.</p>
        )}
        {offer.expiresAt ? (
          <p className="mt-4 text-sm text-white/45">
            Disponible hasta {offer.expiresAt.toLocaleString("es-PY")}
          </p>
        ) : null}
        <OfferResponseForm token={token} disabled={closed} />
      </section>
    </main>
  );
}
