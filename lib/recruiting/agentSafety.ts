const irreversibleActions = new Set([
  "reject_candidate",
  "send_final_offer",
  "hire_candidate",
  "deliver_offer",
  "anonymize_candidate",
]);

const sensitiveActions = new Set([
  "move_stage",
  "generate_offer",
  "create_interview",
  "send_email",
]);

export function requiresHumanApproval(actionType: string) {
  return irreversibleActions.has(actionType) || sensitiveActions.has(actionType);
}

export function computeAutomationRisk(input: {
  actionType: string;
  confidence?: number | null;
  affectsCandidateOutcome?: boolean;
}) {
  if (irreversibleActions.has(input.actionType)) return "critical";
  if (input.affectsCandidateOutcome) return "high";
  if ((input.confidence ?? 100) < 60) return "medium";
  return "low";
}

export function detectUnsafeAutomation(input: {
  actionType: string;
  confidence?: number | null;
  approved?: boolean;
}) {
  const risk = computeAutomationRisk({
    actionType: input.actionType,
    confidence: input.confidence,
    affectsCandidateOutcome: sensitiveActions.has(input.actionType),
  });
  return requiresHumanApproval(input.actionType) && !input.approved
    ? { unsafe: true, risk, reason: "human_approval_required" }
    : { unsafe: false, risk, reason: null };
}

export function validateAutonomousAction(input: {
  actionType: string;
  confidence?: number | null;
  approved?: boolean;
}) {
  const result = detectUnsafeAutomation(input);
  if (result.unsafe) {
    throw new Error(`Autonomous action blocked: ${result.reason}`);
  }
  return result;
}
