export const allowedAutomationTriggers = [
  "candidate.created",
  "candidate.scored",
  "interview.completed",
  "candidate.rejected",
  "candidate.shortlisted",
  "interview.scheduled",
  "interview.no_show",
  "offer.accepted",
  "offer.rejected",
] as const;

const allowedConditionKeys = new Set([
  "cvScore",
  "interviewScore",
  "communicationScore",
  "confidenceScore",
  "hiringSignal",
  "pipelineStage",
  "processingStatus",
]);

const allowedActionTypes = new Set([
  "move_stage",
  "send_email",
  "create_interview",
  "notify_recruiter",
  "generate_offer",
]);

export function isAllowedAutomationTrigger(value: unknown): value is (typeof allowedAutomationTriggers)[number] {
  return typeof value === "string" && allowedAutomationTriggers.includes(value as never);
}

export function validateAutomationRuleJson(input: {
  triggerType: unknown;
  conditions: unknown;
  actions: unknown;
}) {
  if (!isAllowedAutomationTrigger(input.triggerType)) {
    throw new Error("Invalid automation triggerType");
  }

  if (input.conditions && (typeof input.conditions !== "object" || Array.isArray(input.conditions))) {
    throw new Error("Automation conditions must be an object");
  }

  for (const key of Object.keys((input.conditions ?? {}) as Record<string, unknown>)) {
    if (!allowedConditionKeys.has(key)) {
      throw new Error(`Unsupported automation condition: ${key}`);
    }
  }

  if (!Array.isArray(input.actions) || input.actions.length === 0) {
    throw new Error("Automation actions must be a non-empty array");
  }

  for (const action of input.actions) {
    if (!action || typeof action !== "object" || Array.isArray(action)) {
      throw new Error("Automation action must be an object");
    }
    const type = (action as Record<string, unknown>).type;
    if (typeof type !== "string" || !allowedActionTypes.has(type)) {
      throw new Error(`Unsupported automation action: ${String(type)}`);
    }
  }

  return {
    triggerType: input.triggerType,
    conditions: (input.conditions ?? {}) as Record<string, unknown>,
    actions: input.actions as Array<Record<string, unknown>>,
  };
}
