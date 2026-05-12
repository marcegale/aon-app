import { prisma } from "@/app/lib/prisma";
import { Prisma, type RecruitingPipelineStage } from "@/generated/prisma/client";
import { createRecruitingCandidateAuditLog } from "@/lib/recruiting/decision";
import { computeFinalHiringSignal } from "@/lib/recruiting/hiringSignals";
import { createInterviewSessionForCandidate } from "@/lib/recruiting/interview";
import { logOperationalEvent } from "@/lib/recruiting/operationalEvents";
import { validateSearchReadyForAutomation } from "@/lib/recruiting/qualityGates";
import { isFeatureEnabled } from "@/lib/recruiting/settings";
import {
  sendInterviewInvite,
  sendRejectionEmail,
  sendShortlistEmail,
} from "@/lib/recruiting/notifications";

export type RecruitingAutomationTrigger =
  | "candidate.created"
  | "candidate.scored"
  | "interview.completed"
  | "candidate.rejected"
  | "candidate.shortlisted"
  | "interview.scheduled"
  | "interview.no_show"
  | "offer.accepted"
  | "offer.rejected";

type AutomationCondition = {
  cvScore?: { gte?: number; gt?: number; lte?: number; lt?: number };
  interviewScore?: { gte?: number; gt?: number; lte?: number; lt?: number };
  communicationScore?: { gte?: number; gt?: number; lte?: number; lt?: number };
  confidenceScore?: { gte?: number; gt?: number; lte?: number; lt?: number };
  hiringSignal?: string | string[];
  pipelineStage?: string | string[];
  processingStatus?: string | string[];
};

type AutomationAction =
  | { type: "move_stage"; stage: RecruitingPipelineStage; auditAction?: string }
  | { type: "send_email"; template: "shortlist" | "rejection" | "interview_invite" }
  | { type: "create_interview" }
  | { type: "generate_offer" }
  | { type: "notify_recruiter"; message?: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function compareNumber(value: number | null | undefined, condition?: AutomationCondition["cvScore"]) {
  if (!condition) {
    return true;
  }

  if (value === null || value === undefined) {
    return false;
  }

  if (condition.gte !== undefined && value < condition.gte) return false;
  if (condition.gt !== undefined && value <= condition.gt) return false;
  if (condition.lte !== undefined && value > condition.lte) return false;
  if (condition.lt !== undefined && value >= condition.lt) return false;
  return true;
}

function compareString(value: string | null | undefined, expected?: string | string[]) {
  if (!expected) {
    return true;
  }

  return Array.isArray(expected) ? expected.includes(value ?? "") : value === expected;
}

export function matchConditions(input: {
  candidate: {
    cvScore: number | null;
    pipelineStage: string;
    processingStatus: string;
    interviewSessions?: Array<{ interviewScore: number | null; status: string; interviewReport?: unknown }>;
  };
  conditions: unknown;
}) {
  const conditions = isRecord(input.conditions) ? (input.conditions as AutomationCondition) : {};
  const latestInterview = input.candidate.interviewSessions?.[0];
  const report = latestInterview?.interviewReport;
  const communicationScore = isRecord(report) ? Number(report.communicationScore) : null;
  const confidenceScore = isRecord(report) ? Number(report.confidenceScore) : null;
  const hiringSignal =
    isRecord(report) && typeof report.hiringSignal === "string"
      ? report.hiringSignal
      : computeFinalHiringSignal({
          cvScore: input.candidate.cvScore,
          interviewScore: latestInterview?.interviewScore,
          behavioralSignals: report,
        });

  return (
    compareNumber(input.candidate.cvScore, conditions.cvScore) &&
    compareNumber(latestInterview?.interviewScore, conditions.interviewScore) &&
    compareNumber(
      Number.isFinite(communicationScore) ? communicationScore : null,
      conditions.communicationScore,
    ) &&
    compareNumber(
      Number.isFinite(confidenceScore) ? confidenceScore : null,
      conditions.confidenceScore,
    ) &&
    compareString(hiringSignal, conditions.hiringSignal) &&
    compareString(input.candidate.pipelineStage, conditions.pipelineStage) &&
    compareString(input.candidate.processingStatus, conditions.processingStatus)
  );
}

export async function ensureDefaultAutomationRules(tenantId: string, searchId: string) {
  const defaults = [
    {
      name: "Auto shortlist high CV score",
      triggerType: "candidate.scored",
      conditions: { cvScore: { gte: 80 }, processingStatus: "completed" },
      actions: [{ type: "move_stage", stage: "shortlisted", auditAction: "automation.shortlisted" }],
    },
    {
      name: "Auto reject low CV score",
      triggerType: "candidate.scored",
      conditions: { cvScore: { lt: 40 }, processingStatus: "completed" },
      actions: [{ type: "move_stage", stage: "rejected", auditAction: "automation.rejected" }],
    },
    {
      name: "Auto interview shortlisted candidates",
      triggerType: "candidate.shortlisted",
      conditions: { pipelineStage: "shortlisted" },
      actions: [{ type: "create_interview" }],
    },
    {
      name: "Strong hire to offer",
      triggerType: "interview.completed",
      conditions: { hiringSignal: "strong_hire" },
      actions: [{ type: "move_stage", stage: "offer", auditAction: "automation.strong_hire_offer" }],
    },
    {
      name: "Strong hire offer draft",
      triggerType: "interview.completed",
      conditions: { hiringSignal: "strong_hire", interviewScore: { gte: 85 } },
      actions: [{ type: "generate_offer" }],
    },
    {
      name: "Accepted offer to hired",
      triggerType: "offer.accepted",
      conditions: {},
      actions: [{ type: "move_stage", stage: "hired", auditAction: "automation.offer_accepted_hired" }],
    },
    {
      name: "Rejected offer notify recruiter",
      triggerType: "offer.rejected",
      conditions: {},
      actions: [{ type: "notify_recruiter", message: "Offer rejected by candidate" }],
    },
    {
      name: "Scheduled interview reminders",
      triggerType: "interview.scheduled",
      conditions: {},
      actions: [{ type: "notify_recruiter", message: "Interview scheduled; reminders enqueued" }],
    },
    {
      name: "Interview no-show recruiter alert",
      triggerType: "interview.no_show",
      conditions: {},
      actions: [{ type: "notify_recruiter", message: "Interview no-show detected" }],
    },
    {
      name: "Low confidence notify recruiter",
      triggerType: "interview.completed",
      conditions: { confidenceScore: { lt: 30 } },
      actions: [{ type: "notify_recruiter", message: "Low confidence interview signal" }],
    },
    {
      name: "High communication hiring signal",
      triggerType: "interview.completed",
      conditions: { communicationScore: { gte: 85 } },
      actions: [{ type: "notify_recruiter", message: "High communication signal" }],
    },
  ] satisfies Array<{
    name: string;
    triggerType: RecruitingAutomationTrigger;
    conditions: AutomationCondition;
    actions: AutomationAction[];
  }>;

  for (const rule of defaults) {
    const existing = await prisma.recruitingAutomationRule.findFirst({
      where: {
        tenantId,
        searchId,
        name: rule.name,
      },
      select: { id: true },
    });

    if (!existing) {
      await prisma.recruitingAutomationRule.create({
        data: {
          tenantId,
          searchId,
          name: rule.name,
          triggerType: rule.triggerType,
          conditions: rule.conditions as Prisma.InputJsonValue,
          actions: rule.actions as Prisma.InputJsonValue,
        },
      });
    }
  }
}

async function logExecution(input: {
  tenantId: string;
  searchId: string;
  candidateId: string;
  ruleId?: string | null;
  action: string;
  status: "success" | "failed" | "skipped";
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  errorMessage?: string | null;
}) {
  const execution = await prisma.recruitingAutomationExecution.create({
    data: {
      tenantId: input.tenantId,
      searchId: input.searchId,
      candidateId: input.candidateId,
      ruleId: input.ruleId ?? null,
      action: input.action,
      status: input.status,
      input: input.input as Prisma.InputJsonValue | undefined,
      output: input.output as Prisma.InputJsonValue | undefined,
      errorMessage: input.errorMessage ?? null,
    },
  });
  await logOperationalEvent({
    tenantId: input.tenantId,
    searchId: input.searchId,
    candidateId: input.candidateId,
    automationExecutionId: execution.id,
    type: `automation.${input.status}`,
    severity: input.status === "failed" ? "error" : "info",
    message: `Automation action ${input.action} ${input.status}.`,
    metadata: { action: input.action, ruleId: input.ruleId ?? null },
  });
  return execution;
}

export async function executeAutomationActions(input: {
  ruleId: string;
  tenantId: string;
  searchId: string;
  candidateId: string;
  actions: unknown;
}) {
  const actions = Array.isArray(input.actions) ? (input.actions as AutomationAction[]) : [];
  const results: Array<Record<string, unknown>> = [];

  for (const action of actions) {
    if (!isRecord(action) || typeof action.type !== "string") {
      continue;
    }

    try {
      if (action.type === "move_stage") {
        const candidate = await prisma.recruitingCandidate.findFirst({
          where: { id: input.candidateId, search: { tenantId: input.tenantId } },
          select: { id: true, pipelineStage: true },
        });

        if (!candidate) {
          throw new Error("Candidate not found for tenant");
        }

        const stage = action.stage as RecruitingPipelineStage;
        if (candidate.pipelineStage === stage) {
          await logExecution({
            ...input,
            action: action.type,
            status: "skipped",
            input: action,
            output: { reason: "already_in_stage" },
          });
          continue;
        }

        await prisma.recruitingCandidate.update({
          where: { id: input.candidateId },
          data: { pipelineStage: stage, pipelineUpdatedAt: new Date() },
        });
        await createRecruitingCandidateAuditLog({
          tenantId: input.tenantId,
          searchId: input.searchId,
          candidateId: input.candidateId,
          action: action.auditAction ?? "automation.move_stage",
          previousValue: candidate.pipelineStage,
          newValue: stage,
          metadata: { ruleId: input.ruleId },
        });
        await logExecution({
          ...input,
          action: action.type,
          status: "success",
          input: action,
          output: { stage },
        });
        results.push({ action: action.type, status: "success", stage });
      }

      if (action.type === "create_interview") {
        const result = await createInterviewSessionForCandidate({
          tenantId: input.tenantId,
          candidateId: input.candidateId,
          source: "automation",
        });
        await logExecution({
          ...input,
          action: action.type,
          status: result.created ? "success" : "skipped",
          input: action,
          output: { sessionId: result.session.id, interviewLink: result.interviewLink },
        });
        results.push({ action: action.type, status: result.created ? "success" : "skipped" });
      }

      if (action.type === "generate_offer") {
        const existingOffer = await prisma.recruitingOffer.findFirst({
          where: {
            tenantId: input.tenantId,
            candidateId: input.candidateId,
            status: "draft",
          },
          select: { id: true },
        });

        if (existingOffer) {
          await logExecution({
            ...input,
            action: action.type,
            status: "skipped",
            input: action,
            output: { reason: "draft_offer_exists", offerId: existingOffer.id },
          });
          continue;
        }

        const { generateOfferPackage } = await import("@/lib/recruiting/offers");
        const result = await generateOfferPackage({
          tenantId: input.tenantId,
          candidateId: input.candidateId,
        });
        await logExecution({
          ...input,
          action: action.type,
          status: "success",
          input: action,
          output: { offerId: result.offer.id, compensation: result.compensation },
        });
        results.push({ action: action.type, status: "success", offerId: result.offer.id });
      }

      if (action.type === "send_email") {
        const candidate = await prisma.recruitingCandidate.findUnique({
          where: { id: input.candidateId },
          select: { email: true, fullName: true },
        });
        const payload = {
          tenantId: input.tenantId,
          searchId: input.searchId,
          candidateId: input.candidateId,
          toEmail: candidate?.email,
          candidateName: candidate?.fullName,
        };
        const output =
          action.template === "rejection"
            ? await sendRejectionEmail(payload)
            : action.template === "interview_invite"
              ? await sendInterviewInvite(payload)
              : await sendShortlistEmail(payload);
        await logExecution({
          ...input,
          action: action.type,
          status: "skipped",
          input: action,
          output,
        });
        results.push({ action: action.type, status: "skipped", output });
      }

      if (action.type === "notify_recruiter") {
        await logExecution({
          ...input,
          action: action.type,
          status: "skipped",
          input: action,
          output: { reason: "notification_provider_not_configured" },
        });
        results.push({ action: action.type, status: "skipped" });
      }
    } catch (error) {
      await logExecution({
        ...input,
        action: String(action.type),
        status: "failed",
        input: action,
        errorMessage: error instanceof Error ? error.message : "unknown_error",
      });
      throw error;
    }
  }

  return results;
}

export async function evaluateAutomationRules(input: {
  tenantId: string;
  searchId: string;
  candidateId: string;
  triggerType: RecruitingAutomationTrigger;
}) {
  if (!(await isFeatureEnabled(input.tenantId, "automationEnabled"))) {
    return [];
  }
  await validateSearchReadyForAutomation({ tenantId: input.tenantId, searchId: input.searchId });
  await ensureDefaultAutomationRules(input.tenantId, input.searchId);

  const candidate = await prisma.recruitingCandidate.findFirst({
    where: {
      id: input.candidateId,
      search: { id: input.searchId, tenantId: input.tenantId },
    },
    include: {
      interviewSessions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!candidate) {
    throw new Error("Candidate not found for automation context");
  }

  const rules = await prisma.recruitingAutomationRule.findMany({
    where: {
      tenantId: input.tenantId,
      enabled: true,
      triggerType: input.triggerType,
      OR: [{ searchId: input.searchId }, { searchId: null }],
    },
    orderBy: { createdAt: "asc" },
  });

  const executions = [];
  for (const rule of rules) {
    if (!matchConditions({ candidate, conditions: rule.conditions })) {
      continue;
    }

    const result = await executeAutomationActions({
      ruleId: rule.id,
      tenantId: input.tenantId,
      searchId: input.searchId,
      candidateId: input.candidateId,
      actions: rule.actions,
    });
    executions.push({ ruleId: rule.id, name: rule.name, result });
  }

  return executions;
}

export async function enqueueRecruitingAutomation(input: {
  tenantId: string;
  searchId: string;
  candidateId: string;
  triggerType: RecruitingAutomationTrigger;
}) {
  const { recruitingAutomationTask } = await import("@/trigger/recruitingAutomation");
  return recruitingAutomationTask.trigger(input, {
    idempotencyKey: `recruiting-automation:${input.triggerType}:${input.candidateId}:${Date.now()}`,
  });
}
