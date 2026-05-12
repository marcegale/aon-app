import { createServerSupabaseClient } from "@/lib/supabase/server-auth";

type ContextBody = {
  tenantId?: unknown;
  userId?: unknown;
};

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function readSupabaseUserId() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export async function getRecruitingRequestContext(
  request: Request,
  body?: ContextBody | null,
) {
  const url = new URL(request.url);
  const tenantId = readString(body?.tenantId) ?? readString(url.searchParams.get("tenantId"));
  const explicitUserId = readString(body?.userId) ?? readString(url.searchParams.get("userId"));
  const authUserId = await readSupabaseUserId();

  return {
    tenantId,
    userId: explicitUserId ?? authUserId,
    authUserId,
  };
}

export async function getOptionalRecruitingUserId(
  request: Request,
  body?: ContextBody | null,
) {
  const context = await getRecruitingRequestContext(request, body);
  return context.userId;
}

export async function requireRecruitingTenantId(
  request: Request,
  body?: ContextBody | null,
) {
  const context = await getRecruitingRequestContext(request, body);
  if (!context.tenantId) {
    throw new Error("tenantId is required");
  }
  return context.tenantId;
}
