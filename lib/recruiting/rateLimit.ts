type RateLimitInput = {
  key: string;
  limit?: number;
  windowMs?: number;
};

const buckets = new Map<string, { count: number; resetAt: number }>();

export function getRateLimitBackend() {
  return process.env.REDIS_URL ? "redis" : "memory";
}

export function getRateLimitKey(input: {
  request?: Request;
  ip?: string | null;
  token?: string | null;
  tenantId?: string | null;
  action: string;
}) {
  const forwarded = input.request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = input.ip ?? forwarded ?? "unknown";
  return [input.action, input.tenantId ?? "public", input.token ?? ip].join(":");
}

export function checkRateLimitInMemory(input: RateLimitInput) {
  const limit = input.limit ?? 30;
  const windowMs = input.windowMs ?? 60_000;
  const now = Date.now();
  const current = buckets.get(input.key);

  if (!current || current.resetAt <= now) {
    buckets.set(input.key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  current.count += 1;
  return {
    allowed: current.count <= limit,
    remaining: Math.max(0, limit - current.count),
    resetAt: current.resetAt,
  };
}

export async function checkRateLimitRedis(input: RateLimitInput) {
  if (!process.env.REDIS_URL) {
    return checkRateLimitInMemory(input);
  }

  try {
    const dynamicImport = new Function("specifier", "return import(specifier)") as (
      specifier: string,
    ) => Promise<unknown>;
    const redisModule = (await dynamicImport("redis")) as {
      createClient?: (options: { url: string }) => {
        connect: () => Promise<void>;
        incr: (key: string) => Promise<number>;
        pExpire: (key: string, ttl: number) => Promise<unknown>;
        pTTL: (key: string) => Promise<number>;
        quit: () => Promise<void>;
      };
    };
    if (!redisModule.createClient) {
      throw new Error("redis client unavailable");
    }
    const client = redisModule.createClient({ url: process.env.REDIS_URL });
    await client.connect();
    const count = await client.incr(input.key);
    if (count === 1) {
      await client.pExpire(input.key, input.windowMs ?? 60_000);
    }
    const ttl = await client.pTTL(input.key);
    await client.quit();
    const limit = input.limit ?? 30;
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt: Date.now() + Math.max(ttl, 0),
    };
  } catch (error) {
    console.warn("rate_limit.redis_fallback", {
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return checkRateLimitInMemory(input);
  }
}

export function checkRateLimit(input: RateLimitInput) {
  return checkRateLimitInMemory(input);
}

export function assertRateLimit(input: RateLimitInput) {
  const result = checkRateLimit(input);
  if (!result.allowed) {
    throw new Error("rate_limited");
  }
  return result;
}
