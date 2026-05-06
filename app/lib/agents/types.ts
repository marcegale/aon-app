export type AgentStatus = "production" | "partial" | "placeholder" | "legacy";

export type AgentArea =
  | "accounting"
  | "hr"
  | "marketing"
  | "operations"
  | "finance"
  | "admin"
  | "workspace";

export type AgentRunStatus = "started" | "success" | "error";

export type AgentDefinition = {
  id: string;
  name: string;
  description: string;
  area: AgentArea;
  status: AgentStatus;
  href: string;
  apiBase: string;
  adminOnly?: boolean;
  tenantOnly?: boolean;
};

export type AgentRun = {
  id: string;
  agentId: string;
  userId: string | null;
  tenantId: string | null;
  status: AgentRunStatus;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  tokens: number | null;
  cost: number | null;
  createdAt: Date;
};

export type AgentUsage = {
  agentId: string;
  totalRuns: number;
  successRuns: number;
  errorRuns: number;
  totalTokens: number;
  totalCost: number;
};
