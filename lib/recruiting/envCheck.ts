const CORE_ENV = [
  "OPENAI_API_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const OPTIONAL_ENV = [
  "RESEND_API_KEY",
  "RECRUITING_FROM_EMAIL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REDIRECT_URI",
  "GOOGLE_CALENDAR_CLIENT_ID",
  "GOOGLE_CALENDAR_CLIENT_SECRET",
  "GOOGLE_CALENDAR_REDIRECT_URI",
  "REDIS_URL",
  "TRIGGER_SECRET_KEY",
] as const;

function isPresent(name: string) {
  return Boolean(process.env[name]?.trim());
}

export function getRecruitingEnvironmentStatus() {
  const coreMissing: string[] = CORE_ENV.filter((name) => !isPresent(name));
  const optionalMissing: string[] = OPTIONAL_ENV.filter((name) => !isPresent(name));
  const warnings: string[] = [];

  if (!isPresent("DATABASE_URL") && !isPresent("DIRECT_URL")) {
    coreMissing.push("DATABASE_URL or DIRECT_URL");
  } else if (!isPresent("DATABASE_URL") && isPresent("DIRECT_URL")) {
    warnings.push("DIRECT_URL is configured, but DATABASE_URL is not set.");
  }

  if (!isPresent("RECRUITING_TOKEN_ENCRYPTION_KEY") && !isPresent("APP_ENCRYPTION_KEY")) {
    coreMissing.push("RECRUITING_TOKEN_ENCRYPTION_KEY or APP_ENCRYPTION_KEY");
  }

  if (!isPresent("RESEND_API_KEY")) {
    warnings.push("Email delivery will use stub mode until RESEND_API_KEY is configured.");
  }

  if (!isPresent("REDIS_URL")) {
    warnings.push("Rate limiting is using in-memory fallback.");
  }

  if (!isPresent("TRIGGER_SECRET_KEY")) {
    warnings.push("Trigger.dev worker authentication is not fully configured.");
  }

  return {
    ready: coreMissing.length === 0,
    coreMissing,
    optionalMissing,
    warnings,
  };
}
