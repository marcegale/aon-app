import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { openai } from "@/lib/openai";
import { estimateSalaryRange, type CompensationEstimate } from "@/lib/recruiting/compensation";
import { createRecruitingCandidateAuditLog } from "@/lib/recruiting/decision";
import { aggregateCandidateSignals } from "@/lib/recruiting/hiringSignals";
import { validateCandidateReadyForOffer } from "@/lib/recruiting/qualityGates";
import { getRecruitingSettings } from "@/lib/recruiting/settings";
import { randomBytes } from "crypto";
import { enqueueRecruitingEmbedding } from "@/trigger/recruitingEmbeddingTask";

export const recruitingOfferStatuses = [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "rejected",
  "expired",
] as const;

export type RecruitingOfferStatus = (typeof recruitingOfferStatuses)[number];

type OfferInput = {
  tenantId: string;
  candidateId: string;
  baseSalary?: number;
  variableCompensation?: number | null;
  equity?: string | null;
  currency?: string;
  country?: string | null;
  benefits?: Record<string, unknown> | null;
};

export function createOfferPublicToken() {
  return randomBytes(32).toString("base64url");
}

function parseJson(text: string) {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try {
      return JSON.parse(match[0]) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
}

async function offerJson(input: Record<string, unknown>) {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "Actua como recruiter y compensation partner. Devuelve solo JSON valido, sin markdown.",
      },
      { role: "user", content: JSON.stringify(input) },
    ],
  });
  const message = response.output.find((item) => item.type === "message");
  const textBlock =
    message?.type === "message" ? message.content?.find((content) => content.type === "output_text") : null;
  return parseJson(textBlock?.type === "output_text" ? textBlock.text : "{}");
}

function fallbackOfferLetter(input: {
  candidateName: string;
  title: string;
  baseSalary: number;
  currency: string;
  compensation: CompensationEstimate;
}) {
  return [
    `Hola ${input.candidateName},`,
    "",
    `Nos alegra avanzar con una oferta para el rol ${input.title}.`,
    `La propuesta base es ${input.currency} ${input.baseSalary.toLocaleString("en-US")}.`,
    "",
    input.compensation.recommendation,
    "",
    "Quedamos atentos para conversar detalles y proximos pasos.",
  ].join("\n");
}

export async function generateOfferLetter(input: {
  candidateName: string;
  searchTitle: string;
  compensation: CompensationEstimate;
  baseSalary: number;
  variableCompensation?: number | null;
  equity?: string | null;
  currency: string;
  country?: string | null;
  benefits?: Record<string, unknown> | null;
}) {
  const parsed = await offerJson({
    task: "Genera carta de oferta profesional y concreta.",
    outputShape: { generatedContent: "string", aiSummary: "string" },
    context: input,
  });

  return {
    generatedContent:
      typeof parsed.generatedContent === "string"
        ? parsed.generatedContent
        : fallbackOfferLetter({
            candidateName: input.candidateName,
            title: input.searchTitle,
            baseSalary: input.baseSalary,
            currency: input.currency,
            compensation: input.compensation,
          }),
    aiSummary:
      typeof parsed.aiSummary === "string"
        ? parsed.aiSummary
        : "Oferta generada con rango recomendado y paquete base.",
  };
}

export async function generateNegotiationSummary(input: {
  compensation: CompensationEstimate;
  baseSalary: number;
  candidateSignals?: unknown;
}) {
  const parsed = await offerJson({
    task: "Resume riesgo de negociacion y argumentos de compensacion para recruiter.",
    outputShape: { summary: "string", risk: "string" },
    context: input,
  });

  return {
    summary:
      typeof parsed.summary === "string"
        ? parsed.summary
        : input.compensation.recommendation,
    risk:
      typeof parsed.risk === "string"
        ? parsed.risk
        : input.compensation.compensationRisk,
  };
}

export async function generateOfferPackage(input: OfferInput) {
  await validateCandidateReadyForOffer({ tenantId: input.tenantId, candidateId: input.candidateId });
  const settings = await getRecruitingSettings(input.tenantId);
  const candidate = await prisma.recruitingCandidate.findFirst({
    where: { id: input.candidateId, search: { tenantId: input.tenantId } },
    include: {
      search: true,
      interviewSessions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!candidate) {
    throw new Error("Candidate not found for tenant");
  }

  const latestInterview = candidate.interviewSessions[0];
  const signals = aggregateCandidateSignals({
    cvScore: candidate.cvScore,
    interviewScore: latestInterview?.interviewScore,
    behavioralSignals: latestInterview?.interviewReport,
  });
  const compensation = await estimateSalaryRange({
    cvSummary: candidate.cvSummary,
    cvReport: candidate.cvReport,
    seniority: candidate.search.seniority,
    location: candidate.search.location,
    interviewScore: latestInterview?.interviewScore,
    cvScore: candidate.cvScore,
    hiringSignals: signals.finalSignal,
    currency: input.currency ?? settings.defaultCurrency,
  });
  const baseSalary = input.baseSalary ?? compensation.estimatedMax;
  const letter = await generateOfferLetter({
    candidateName: candidate.fullName ?? candidate.email ?? "candidato",
    searchTitle: candidate.search.title,
    compensation,
    baseSalary,
    variableCompensation: input.variableCompensation,
    equity: input.equity,
    currency: input.currency ?? settings.defaultCurrency,
    country: input.country ?? candidate.search.location ?? settings.defaultCountry,
    benefits: input.benefits,
  });

  const offer = await prisma.recruitingOffer.create({
    data: {
      tenantId: input.tenantId,
      candidateId: candidate.id,
      searchId: candidate.searchId,
      status: "draft",
      publicToken: createOfferPublicToken(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  const version = await prisma.recruitingOfferVersion.create({
    data: {
      offerId: offer.id,
      baseSalary,
      variableCompensation: input.variableCompensation ?? null,
      equity: input.equity ?? null,
      currency: input.currency ?? settings.defaultCurrency,
      country: input.country ?? candidate.search.location ?? settings.defaultCountry,
      benefits: (input.benefits ?? {
        compensation,
        hiringSignals: signals,
      }) as Prisma.InputJsonValue,
      generatedContent: letter.generatedContent,
      aiSummary: letter.aiSummary,
    },
  });
  const updatedOffer = await prisma.recruitingOffer.update({
    where: { id: offer.id },
    data: { currentVersionId: version.id },
    include: { versions: { orderBy: { createdAt: "desc" } } },
  });

  await createRecruitingCandidateAuditLog({
    tenantId: input.tenantId,
    searchId: candidate.searchId,
    candidateId: candidate.id,
    action: "offer.generated",
    newValue: offer.id,
    metadata: {
      offerId: offer.id,
      versionId: version.id,
      compensation,
      hiringSignal: signals.finalSignal,
    },
  });
  await enqueueRecruitingEmbedding({
    tenantId: input.tenantId,
    candidateId: candidate.id,
    sourceType: "offer.generated",
  }).catch((error) =>
    console.warn("embedding.offer_generated_failed", {
      candidateId: candidate.id,
      error: error instanceof Error ? error.message : "unknown",
    }),
  );

  return {
    offer: updatedOffer,
    version,
    compensation,
    negotiation: await generateNegotiationSummary({
      compensation,
      baseSalary,
      candidateSignals: signals,
    }),
  };
}
