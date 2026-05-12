export type RecruitingAgentType =
  | "sourcing"
  | "screening"
  | "interview"
  | "offer"
  | "onboarding"
  | "analytics";

export type RecruitingAgentInput = {
  tenantId: string;
  searchId?: string | null;
  candidateId?: string | null;
  taskType?: string;
  payload?: Record<string, unknown>;
};

export type RecruitingAgentResult = {
  summary: string;
  recommendations: Array<Record<string, unknown>>;
  actions?: Array<Record<string, unknown>>;
  metrics?: Record<string, unknown>;
  requiresApproval?: boolean;
};

export type RecruitingAgent = {
  agentType: RecruitingAgentType;
  validateInput(input: RecruitingAgentInput): void | Promise<void>;
  execute(input: RecruitingAgentInput): Promise<RecruitingAgentResult>;
  generateSummary(result: RecruitingAgentResult): string;
  generateOperationalLog(input: RecruitingAgentInput, result: RecruitingAgentResult): Record<string, unknown>;
};

export function assertTenant(input: RecruitingAgentInput) {
  if (!input.tenantId) {
    throw new Error("tenantId is required");
  }
}

export function scoreBand(score?: number | null) {
  if (score === null || score === undefined) return "pending";
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  if (score > 0) return "low";
  return "pending";
}
