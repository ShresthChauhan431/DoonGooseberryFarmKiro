/**
 * Rate-Limited Authentication API Route
 *
 * This demonstrates how to apply rate limiting to API routes.
 * The Better Auth routes at /api/auth/[...all] should also be protected.
 */

import { type NextRequest, NextResponse } from 'next/server';
import {
  authRateLimiter,
  checkRateLimit,
  getClientIdentifier,
  rateLimitError,
} from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  // Get client identifier (IP address)
  const identifier = getClientIdentifier(request);

  // Check rate limit
  const rateLimit = await checkRateLimit(authRateLimiter, identifier);

  if (!rateLimit.success) {
    // Log rate limit violation
    console.warn(`Rate limit exceeded for ${identifier} on auth endpoint`);

    return rateLimitError(rateLimit.reset);
  }

  // Add rate limit headers to response
  const headers = {
    'X-RateLimit-Limit': rateLimit.limit.toString(),
    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
    'X-RateLimit-Reset': rateLimit.reset.toString(),
  };

  // Process the request...
  return NextResponse.json({ message: 'Request processed successfully' }, { headers });
}

/**
 * Rate Limiting Best Practices
 *
 * 1. Apply rate limiting to all authentication endpoints
 * 2. Use different limits for different endpoint types
 * 3. Log rate limit violations for security monitoring
 * 4. Return clear error messages with retry information
 * 5. Include rate limit headers in all responses
 * 6. Consider IP-based and user-based rate limiting
 * 7. Adjust limits based on actual usage patterns
 */
