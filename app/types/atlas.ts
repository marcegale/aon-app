// Atlas — shared TypeScript types (Phase 4A)
// Desktop ↔ Backend interface contracts only. No Prisma, no DB.

export type AtlasPermissionLevel = "PUBLIC" | "SENSITIVE" | "DESTRUCTIVE";

export type AtlasErrorCode =
  | "TIMEOUT"
  | "BLOCKED"
  | "EXEC_ERROR"
  | "NON_ZERO_EXIT"
  | "CAPABILITY_UNAVAILABLE"
  | "CONNECTOR_REQUIRED";

export type AtlasConnectorStatus = "disconnected" | "expired" | "error";

export type AtlasConnectorProvider =
  | "gmail"
  | "outlook_mail"
  | "google_calendar"
  | "outlook_calendar"
  | "whatsapp"
  | "browser_profile"
  | "local_filesystem"
  | "local_apps"
  | "local_agent_claude"
  | "local_agent_codex"
  | "web_agent";

export interface AtlasConnectorRequiredResult {
  provider: AtlasConnectorProvider;
  status: AtlasConnectorStatus;
  display_name: string;
  connect_url: string;
}

export interface AtlasActionDisplay {
  title: string;
  description: string;
  warning?: string | null;
}

export interface AtlasAction {
  id: string;
  tool: string;
  operation: string;
  params: Record<string, unknown>;
  permission_level: AtlasPermissionLevel;
  display: AtlasActionDisplay;
  requires_result?: boolean;
}

export interface AtlasActionPlan {
  intent: string;
  actions: AtlasAction[];
}

export interface AtlasActionResult {
  ok: boolean;
  tool: string;
  operation: string;
  permission_level: AtlasPermissionLevel;
  stdout: string;
  stderr: string;
  returncode: number | null;
  duration_ms: number;
  truncated: boolean;
  stderr_truncated: boolean;
  error_code: AtlasErrorCode | null;
  error_message: string | null;
  started_at: string;
  finished_at: string;
  connector?: AtlasConnectorRequiredResult | null;
}

export interface AtlasPlanRequest {
  prompt: string;
  device_key: string;
  user_name?: string;
}

export interface AtlasPlanResponse {
  ok: boolean;
  response?: string;
  mode?: "ai" | "mock";
  action_plan?: AtlasActionPlan | null;
  error?: {
    code: string;
    message: string;
  };
}
