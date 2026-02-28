/**
 * Rate Limiting Configuration
 *
 * Protects against brute force attacks and abuse by limiting
 * the number of requests from a single IP address.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client for rate limiting
// If Upstash credentials are not configured, use in-memory store (development only)
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : undefined;

/**
 * Rate limiter for authentication endpoints
 * Limits: 10 attempts per 10 seconds per IP
 */
export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      prefix: 'ratelimit:auth',
    })
  : null;

/**
 * Rate limiter for API endpoints
 * Limits: 100 requests per minute per IP
 */
export const apiRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: 'ratelimit:api',
    })
  : null;

/**
 * Rate limiter for payment endpoints
 * Limits: 5 attempts per minute per IP
 */
export const paymentRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: 'ratelimit:payment',
    })
  : null;

/**
 * Rate limiter for search endpoints
 * Limits: 30 requests per minute per IP
 */
export const searchRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      analytics: true,
      prefix: 'ratelimit:search',
    })
  : null;

/**
 * Get client identifier from request
 * Uses IP address or fallback to a default identifier
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers (depending on hosting platform)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  // Use the first available IP
  const ip = cfConnectingIp || realIp || forwardedFor?.split(',')[0];

  return ip?.trim() || 'anonymous';
}

/**
 * Check rate limit for a request
 * Returns success status and remaining attempts
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  // If rate limiter is not configured (development), allow all requests
  if (!limiter) {
    return {
      success: true,
      limit: 999,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }

  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Rate limit error response
 */
export function rateLimitError(reset: number) {
  const resetDate = new Date(reset);
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter,
      resetAt: resetDate.toISOString(),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    }
  );
}

/**
 * Apply rate limiting to a Server Action
 * Usage:
 *
 * export async function loginAction(data: LoginInput) {
 *   const identifier = getClientIdentifier(request);
 *   const rateLimit = await checkRateLimit(authRateLimiter, identifier);
 *
 *   if (!rateLimit.success) {
 *     return { error: 'Too many login attempts. Please try again later.' };
 *   }
 *
 *   // Process login...
 * }
 */

/**
 * Development mode warning
 */
if (!redis && process.env.NODE_ENV === 'production') {
  console.warn(
    '⚠️  Rate limiting is disabled because Upstash Redis is not configured. ' +
      'Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.'
  );
}

/**
 * Rate Limiting Setup Instructions
 *
 * 1. Create a free Upstash account at https://upstash.com
 * 2. Create a new Redis database
 * 3. Copy the REST URL and REST Token
 * 4. Add to .env:
 *    UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
 *    UPSTASH_REDIS_REST_TOKEN=your-token
 * 5. Deploy and rate limiting will be active
 *
 * Note: In development without Upstash, rate limiting is disabled
 * to avoid blocking during testing.
 */
