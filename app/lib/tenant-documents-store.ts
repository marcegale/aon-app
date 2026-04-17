import { prisma } from "@/app/lib/prisma";
import type { TenantDocument } from "@/app/(platform)/assessment/types/documents";

type PrismaTenantDocument = {
  id: string;
  tenantId: string;
  category: string;
  title: string;
  description: string;
  status: string;
  source: string;
  fileUrl: string | null;
  fileName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function mapTenantDocument(record: PrismaTenantDocument): TenantDocument {
  return {
    id: record.id,
    tenantId: record.tenantId,
    category: record.category as TenantDocument["category"],
    title: record.title,
    description: record.description,
    status: record.status as TenantDocument["status"],
    source: record.source as TenantDocument["source"],
    fileUrl: record.fileUrl ?? undefined,
    fileName: record.fileName ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function listTenantDocuments(tenantId: string): Promise<TenantDocument[]> {
  const rows = await prisma.tenantDocument.findMany({
    where: { tenantId },
    orderBy: [{ category: "asc" }, { createdAt: "desc" }],
  });

  return rows.map(mapTenantDocument);
}

type CreateTenantDocumentInput = {
  tenantId: string;
  category: TenantDocument["category"];
  title: string;
  description: string;
  status: TenantDocument["status"];
  source: TenantDocument["source"];
  fileUrl?: string;
  fileName?: string;
};

export async function createTenantDocument(
  input: CreateTenantDocumentInput,
): Promise<TenantDocument> {
  const row = await prisma.tenantDocument.create({
    data: {
      tenantId: input.tenantId,
      category: input.category,
      title: input.title,
      description: input.description,
      status: input.status,
      source: input.source,
      fileUrl: input.fileUrl ?? null,
      fileName: input.fileName ?? null,
    },
  });

  return mapTenantDocument(row);
}

export async function upsertTenantDocumentByCategory(
  input: CreateTenantDocumentInput,
): Promise<TenantDocument> {
  const existing = await prisma.tenantDocument.findFirst({
    where: {
      tenantId: input.tenantId,
      category: input.category,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!existing) {
    return createTenantDocument(input);
  }

  const row = await prisma.tenantDocument.update({
    where: {
      id: existing.id,
    },
    data: {
      title: input.title,
      description: input.description,
      status: input.status,
      source: input.source,
      fileUrl: input.fileUrl ?? null,
      fileName: input.fileName ?? null,
    },
  });

  return mapTenantDocument(row);
}