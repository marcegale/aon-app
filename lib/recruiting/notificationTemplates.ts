import { prisma } from "@/app/lib/prisma";

export async function getNotificationTemplate(input: { tenantId: string; type: string }) {
  return prisma.recruitingNotificationTemplate.findUnique({
    where: { tenantId_type: { tenantId: input.tenantId, type: input.type } },
  });
}

export function renderTemplateWithVariables(template: string, variables: Record<string, unknown>) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key: string) => {
    const value = variables[key];
    return value === null || value === undefined ? "" : String(value);
  });
}

export async function upsertNotificationTemplate(input: {
  tenantId: string;
  type: string;
  subject: string;
  body: string;
  enabled?: boolean;
}) {
  return prisma.recruitingNotificationTemplate.upsert({
    where: { tenantId_type: { tenantId: input.tenantId, type: input.type } },
    create: {
      tenantId: input.tenantId,
      type: input.type,
      subject: input.subject,
      body: input.body,
      enabled: input.enabled ?? true,
    },
    update: {
      subject: input.subject,
      body: input.body,
      enabled: input.enabled ?? true,
    },
  });
}
