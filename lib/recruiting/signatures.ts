import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function createOfferSignature(input: {
  tenantId: string;
  offerId: string;
  candidateId: string;
  signerEmail: string;
  signerName?: string | null;
  metadata?: Record<string, unknown>;
}) {
  return prisma.recruitingOfferSignature.create({
    data: {
      tenantId: input.tenantId,
      offerId: input.offerId,
      candidateId: input.candidateId,
      signerEmail: input.signerEmail,
      signerName: input.signerName ?? null,
      status: "pending",
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function markOfferSigned(input: {
  tenantId: string;
  offerId: string;
  candidateId: string;
  signerEmail: string;
  signerName?: string | null;
  signatureText?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}) {
  return prisma.recruitingOfferSignature.create({
    data: {
      tenantId: input.tenantId,
      offerId: input.offerId,
      candidateId: input.candidateId,
      signerEmail: input.signerEmail,
      signerName: input.signerName ?? null,
      status: "signed",
      signedAt: new Date(),
      signatureText: input.signatureText ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function markOfferDeclined(input: {
  tenantId: string;
  offerId: string;
  candidateId: string;
  signerEmail: string;
  signerName?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}) {
  return prisma.recruitingOfferSignature.create({
    data: {
      tenantId: input.tenantId,
      offerId: input.offerId,
      candidateId: input.candidateId,
      signerEmail: input.signerEmail,
      signerName: input.signerName ?? null,
      status: "declined",
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export function generateSignatureSummary(input: {
  signerEmail: string;
  status: string;
  signedAt?: Date | null;
}) {
  return `${input.signerEmail} ${input.status}${input.signedAt ? ` at ${input.signedAt.toISOString()}` : ""}`;
}
