/**
 * middleware.ts
 *
 * Next.js Edge Middleware — runs before every matched request.
 *
 * ── Execution order ────────────────────────────────────────────────────────
 *
 *  1. Force HTTPS in production (http → https redirect)
 *
 *  2. CORS handling — applied to EVERY /api/* route
 *       a. OPTIONS preflight  → short-circuit with 204 + full CORS headers.
 *          The route handler is NEVER called for preflight requests.
 *       b. All other methods  → pass through to the route handler and attach
 *          CORS headers to whatever response it returns.
 *
 *  3. Session-based page-route guards
 *       /account/*  → any authenticated user
 *       /admin/*    → ADMIN role required
 *       /checkout/* → any authenticated user
 *
 *     ⚠️  This step is intentionally skipped for /api/* routes:
 *         • /api/auth/* IS the Better Auth endpoint — calling getSession()
 *           against it would create a circular dependency.
 *         • All other API routes manage their own auth internally.
 *
 * ── Matched routes ─────────────────────────────────────────────────────────
 *
 *  /api/:path*        CORS + OPTIONS
 *  /account/:path*    auth guard
 *  /admin/:path*      admin guard
 *  /checkout/:path*   auth guard
 *
 *  Everything else (/_next/*, /favicon.ico, public assets, pages not listed
 *  above) is intentionally excluded — the middleware never runs for them,
 *  keeping cold-start latency minimal.
 *
 * ── Runtime ────────────────────────────────────────────────────────────────
 *
 *  nodejs — required because Better Auth's session resolver uses the
 *  postgres-js / Drizzle database driver which is not available in the
 *  Edge runtime.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { applyCorsHeaders, getAllowedOrigin, preflightResponse } from '@/lib/cors';
import '@/lib/auth/types';

// ─── Middleware function ───────────────────────────────────────────────────────

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // ── 1. Force HTTPS in production ──────────────────────────────────────────
  //
  // Vercel sets the x-forwarded-proto header on every inbound request.
  // If it is not "https" in production, someone (or a misconfigured proxy)
  // is communicating over plain HTTP — redirect them permanently.
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') !== 'https'
  ) {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = 'https:';
    return NextResponse.redirect(httpsUrl.toString(), { status: 301 });
  }

  // ── 2. CORS — all /api/* routes ───────────────────────────────────────────
  //
  // We must handle CORS before any authentication or business logic so that:
  //
  //   a) OPTIONS preflight requests (which carry NO cookies and NO body) are
  //      answered immediately without touching auth state.
  //
  //   b) Error responses from auth / business logic still carry CORS headers,
  //      otherwise the browser hides the response body and the developer only
  //      sees an opaque network error.
  //
  // getAllowedOrigin() returns the caller's exact Origin value when it is on
  // the allow-list (driven by env vars in lib/cors.ts), or null otherwise.
  // We echo the exact origin back — never "*" — so that
  // Access-Control-Allow-Credentials: true is honoured by browsers.
  if (pathname.startsWith('/api/')) {
    const allowedOrigin = getAllowedOrigin(request);

    // ── 2a. OPTIONS preflight — short-circuit immediately ───────────────────
    //
    // The browser sends a preflight OPTIONS request before every cross-origin
    // request that uses a non-simple method (POST, PUT, DELETE, PATCH) or
    // includes custom headers (Content-Type: application/json, Authorization,
    // Cookie, …).
    //
    // We must respond with:
    //   • 204 No Content (or 200 — 204 is preferred)
    //   • Access-Control-Allow-Origin  (exact origin from allow-list)
    //   • Access-Control-Allow-Methods
    //   • Access-Control-Allow-Headers
    //   • Access-Control-Allow-Credentials
    //   • Access-Control-Max-Age       (preflight cache duration)
    //   • Vary: Origin                 (cache correctness for CDNs)
    //
    // preflightResponse() handles all of this and returns 403 for unknown
    // origins, which is the correct security posture.
    if (request.method === 'OPTIONS') {
      return preflightResponse(allowedOrigin);
    }

    // ── 2b. Non-preflight API request ───────────────────────────────────────
    //
    // Pass the request through to the route handler unchanged.
    // NextResponse.next() creates a response proxy; any headers we set on it
    // will be merged into the route handler's actual response before it is
    // sent to the client.
    //
    // This means the route handler (Better Auth, upload handler, rate-limiter,
    // etc.) runs exactly as before — we only decorate the response.
    const response = NextResponse.next();
    return applyCorsHeaders(response, allowedOrigin);
  }

  // ── 3. Session-based page-route guards ────────────────────────────────────
  //
  // We call auth.api.getSession() once and reuse the result across all guard
  // checks to avoid redundant DB / cookie-cache reads per request.
  //
  // This is intentionally NOT called for /api/* routes (handled above) to
  // avoid circular dependencies and unnecessary DB round-trips on API calls.
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // ── 3a. /account/* — require any authenticated session ───────────────────
  if (pathname.startsWith('/account')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── 3b. /admin/* — require ADMIN role ────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.user.role !== 'ADMIN') {
      // Authenticated but not an admin — send to home page.
      // Redirecting to / instead of /login prevents leaking that an admin
      // route exists at this path.
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // ── 3c. /checkout/* — require any authenticated session ──────────────────
  if (pathname.startsWith('/checkout')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      // Hard-code /checkout as the post-login redirect: the checkout page
      // manages its own step state and will pick up where the user left off.
      loginUrl.searchParams.set('redirect', '/checkout');
      return NextResponse.redirect(loginUrl);
    }
  }

  // All checks passed — let the request through to the page / route handler.
  return NextResponse.next();
}

// ─── Matcher ──────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    // API routes — CORS headers + OPTIONS preflight handling
    '/api/:path*',

    // Page routes — session-based auth / role guards
    '/account/:path*',
    '/admin/:path*',
    '/checkout/:path*',
  ],
};

// Keep the Node.js runtime — required for Better Auth's DB-backed session
// resolver (postgres-js / Drizzle ORM are not available in the Edge runtime).
export const runtime = 'nodejs';
