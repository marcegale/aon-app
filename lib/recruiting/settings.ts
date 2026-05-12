import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

const defaults = {
  defaultTimezone: "UTC",
  defaultCurrency: "USD",
  defaultCountry: null,
  emailFromName: null,
  emailFromAddress: null,
  offerApprovalRequired: false,
  interviewReminderHours: [24, 1],
  automationEnabled: true,
  aiScoringEnabled: true,
  voiceInterviewEnabled: true,
};

export async function getRecruitingSettings(tenantId: string) {
  const settings = await prisma.recruitingTenantSettings.findUnique({ where: { tenantId } });
  return settings ?? { id: null, tenantId, createdAt: null, updatedAt: null, ...defaults };
}

export async function upsertRecruitingSettings(input: {
  tenantId: string;
  data: Partial<typeof defaults>;
}) {
  const data = {
    defaultTimezone: input.data.defaultTimezone,
    defaultCurrency: input.data.defaultCurrency,
    defaultCountry: input.data.defaultCountry,
    emailFromName: input.data.emailFromName,
    emailFromAddress: input.data.emailFromAddress,
    offerApprovalRequired: input.data.offerApprovalRequired,
    interviewReminderHours: input.data.interviewReminderHours,
    automationEnabled: input.data.automationEnabled,
    aiScoringEnabled: input.data.aiScoringEnabled,
    voiceInterviewEnabled: input.data.voiceInterviewEnabled,
  };
  return prisma.recruitingTenantSettings.upsert({
    where: { tenantId: input.tenantId },
    create: {
      tenantId: input.tenantId,
      defaultTimezone: data.defaultTimezone ?? defaults.defaultTimezone,
      defaultCurrency: data.defaultCurrency ?? defaults.defaultCurrency,
      defaultCountry: data.defaultCountry ?? null,
      emailFromName: data.emailFromName ?? null,
      emailFromAddress: data.emailFromAddress ?? null,
      offerApprovalRequired: data.offerApprovalRequired ?? defaults.offerApprovalRequired,
      interviewReminderHours: (data.interviewReminderHours ??
        defaults.interviewReminderHours) as Prisma.InputJsonValue,
      automationEnabled: data.automationEnabled ?? defaults.automationEnabled,
      aiScoringEnabled: data.aiScoringEnabled ?? defaults.aiScoringEnabled,
      voiceInterviewEnabled: data.voiceInterviewEnabled ?? defaults.voiceInterviewEnabled,
    },
    update: {
      ...data,
      interviewReminderHours: data.interviewReminderHours as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function isFeatureEnabled(
  tenantId: string,
  feature: "automationEnabled" | "aiScoringEnabled" | "voiceInterviewEnabled",
) {
  const settings = await getRecruitingSettings(tenantId);
  return Boolean(settings[feature]);
}
