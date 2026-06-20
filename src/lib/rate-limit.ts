import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// Create a new ratelimiter, that allows 5 requests per 15 minutes
export const authRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/auth",
});

// 10 requests per day
export const insightsRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 d"),
  analytics: true,
  prefix: "@upstash/ratelimit/insights",
});

// 60 requests per minute
export const activitiesRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit/activities",
});

export async function checkRateLimit(request: NextRequest, ratelimit: Ratelimit) {
  if (process.env.E2E_AUTH_BYPASS_ENABLED === 'true' && request.cookies.has('e2e-mock-auth')) {
    return null; // Bypass rate limits during E2E testing
  }

  const ip = request.ip ?? '127.0.0.1';
  try {
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }
  } catch (err) {
    console.error('Rate limit error:', err);
    // fail-open
  }
  return null;
}
