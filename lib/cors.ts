/**
 * lib/cors.ts
 *
 * Centralised CORS utility for Next.js middleware and API route handlers.
 *
 * ── Design principles ──────────────────────────────────────────────────────
 *
 *  1. Zero hard-coded domains.
 *     Every allowed origin is derived from environment variables so the same
 *     build artefact works in development, staging, and production without
 *     code changes.
 *
 *  2. Never use Access-Control-Allow-Origin: "*" with credentials.
 *     When the browser sends cookies or an Authorization header the ACAO value
 *     MUST be the caller's exact origin (not a wildcard) and
 *     Access-Control-Allow-Credentials must be "true".  We echo back the
 *     request's Origin header when it is on the allow-list.
 *
 *  3. Always set Vary: Origin.
 *     When ACAO is dynamic (per-caller) the response must carry Vary: Origin
 *     so CDNs / Vercel Edge Cache do not serve a response that was permissioned
 *     for origin A to a subsequent request from origin B.
 *
 *  4. Single cold-start allocation.
 *     The allowed-origin Set is built once when the module is first imported
 *     and reused on every request — no per-request allocations on the hot path.
 *
 * ── Environment variables ──────────────────────────────────────────────────
 *
 *  Required (set in Vercel → Settings → Environment Variables):
 *
 *    NEXT_PUBLIC_APP_URL
 *      The public URL of the frontend deployment.
 *      e.g. https://doon-gooseberry-farm.vercel.app
 *
 *    AUTH_URL
 *      The canonical URL of the API / Better Auth server.
 *      Same-origin setup  → same value as NEXT_PUBLIC_APP_URL
 *      Cross-origin setup → https://doon-gooseberry-farm-kiro.vercel.app
 *
 *  Optional:
 *
 *    NEXT_PUBLIC_AUTH_URL
 *      Client-side alias for AUTH_URL (inlined into the browser bundle by
 *      Next.js).  Included in the allow-list so both spellings are covered.
 *
 *    CORS_ADDITIONAL_ORIGINS
 *      Comma-separated list of extra allowed origins.
 *      Useful for Vercel preview deployments or staging environments.
 *      e.g. "https://pr-42-acme.vercel.app,https://staging.example.com"
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Split a comma-separated origin string, trim each entry, and remove any
 * trailing slashes so that "https://foo.com/" and "https://foo.com" both match
 * the normalised form used during lookup.
 */
function parseOriginList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

/**
 * Build the immutable set of allowed origins from environment variables.
 * Called exactly once at module load time.
 */
function buildAllowedOrigins(): ReadonlySet<string> {
  const candidates: string[] = [
    // Primary: the NEW frontend deployment (the origin making the API calls)
    ...parseOriginList(process.env.NEXT_PUBLIC_APP_URL),

    // The API server itself — needed for same-origin SSR calls and health checks
    ...parseOriginList(process.env.AUTH_URL),

    // Client-side alias of AUTH_URL — include both spellings to be safe
    ...parseOriginList(process.env.NEXT_PUBLIC_AUTH_URL),

    // Escape hatch: PR previews, staging environments, custom domains
    ...parseOriginList(process.env.CORS_ADDITIONAL_ORIGINS),

    // Localhost variants — always allowed in non-production environments so
    // local development works without setting any env vars.
    ...(process.env.NODE_ENV !== 'production'
      ? [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
        ]
      : []),
  ];

  return Object.freeze(new Set(candidates));
}

// ─── Allowed-origin registry ──────────────────────────────────────────────────

/**
 * Immutable set of origins that are permitted to make cross-origin requests to
 * this API.  Built once at cold-start; never mutated at runtime.
 *
 * Exported so unit tests and other server-only modules can inspect the set
 * without triggering side effects.
 */
export const ALLOWED_ORIGINS: ReadonlySet<string> = buildAllowedOrigins();

// ─── Static header map ────────────────────────────────────────────────────────

/**
 * CORS headers that are identical for every response — both preflight and
 * actual.
 *
 * Access-Control-Allow-Origin is intentionally absent here because its value
 * is dynamic (echoed from the allow-list per request).
 */
export const CORS_HEADERS = {
  /**
   * Enumerate every HTTP method used by this API.
   * PATCH is included for future partial-update endpoints.
   */
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',

  /**
   * Request headers the browser is allowed to send.
   *
   *   Content-Type     → JSON / multipart bodies
   *   Authorization    → Bearer tokens (used alongside or instead of cookies)
   *   X-Requested-With → Conventional AJAX identifier header
   *   Accept           → Content negotiation
   *   Origin           → Included by the browser automatically; list it here
   *                      so it is not stripped on redirects
   *   Cookie           → Explicit allowance for credential forwarding
   */
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cookie',

  /**
   * "true" (as a string) tells the browser it may include credentials
   * (cookies, TLS client certificates, HTTP authentication) in the request.
   *
   * MUST be "true" (not a boolean) and MUST be paired with an exact origin
   * in Access-Control-Allow-Origin — the wildcard "*" is forbidden when this
   * header is present.
   */
  'Access-Control-Allow-Credentials': 'true',

  /**
   * Cache the preflight response for 24 hours (86 400 seconds).
   * This prevents the browser from sending a redundant OPTIONS round-trip
   * before every real API request, which is especially noticeable on mobile
   * networks.
   *
   * Note: Chrome caps this at 7 200 s (2 h); Firefox caps at 86 400 s.
   */
  'Access-Control-Max-Age': '86400',

  /**
   * Inform shared caches (Vercel Edge, CDNs, proxies) that the response
   * content can differ based on the caller's Origin header.
   *
   * Without this header a cache that stored a response permissioned for
   * origin A could (incorrectly) serve it to origin B, leading to silent
   * CORS failures that are very difficult to debug.
   */
  Vary: 'Origin',
} as const;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Resolve the caller's `Origin` header against the allow-list.
 *
 * Returns:
 *   • The normalised origin string — when the origin is on the allow-list.
 *   • `null`                       — when:
 *       – the request has no Origin header (same-origin browser navigation,
 *         server-to-server call, curl without -H 'Origin: …')
 *       – the origin is present but NOT on the allow-list
 *
 * Callers that receive `null` should omit CORS headers entirely — do NOT fall
 * back to `"*"` in production.
 *
 * @example
 * const allowed = getAllowedOrigin(request);
 * if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 */
export function getAllowedOrigin(request: NextRequest): string | null {
  const raw = request.headers.get('origin');
  if (!raw) return null;

  // Normalise: strip trailing slash before set lookup
  const origin = raw.replace(/\/+$/, '');
  return ALLOWED_ORIGINS.has(origin) ? origin : null;
}

/**
 * Attach all CORS response headers to an existing `NextResponse`.
 *
 * Mutates the response in place and returns the same instance so callers can
 * chain it:
 *
 * @example
 * const res = NextResponse.next();
 * return applyCorsHeaders(res, getAllowedOrigin(request));
 *
 * When `allowedOrigin` is `null` (caller not on the allow-list) the response
 * is returned unchanged — no CORS headers are added.
 */
export function applyCorsHeaders(
  response: NextResponse,
  allowedOrigin: string | null
): NextResponse {
  if (!allowedOrigin) return response;

  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);

  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value);
  }

  return response;
}

/**
 * Build a complete preflight (OPTIONS) response.
 *
 * Returns:
 *   • 204 No Content  + full CORS headers — origin is on the allow-list.
 *   • 403 Forbidden                       — origin is NOT on the allow-list.
 *
 * 204 is preferred over 200 for preflights: it has no body, signals
 * "permission granted" cleanly, and is marginally faster for clients to parse.
 *
 * @example
 * if (request.method === 'OPTIONS') {
 *   return preflightResponse(getAllowedOrigin(request));
 * }
 */
export function preflightResponse(allowedOrigin: string | null): NextResponse {
  if (!allowedOrigin) {
    return new NextResponse(null, {
      status: 403,
      statusText: 'Forbidden — origin not in CORS allow-list',
    });
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      ...CORS_HEADERS,
    },
  });
}

/**
 * Create a JSON error response that still carries CORS headers.
 *
 * Without CORS headers on error responses the browser masks the body with a
 * generic network error, making debugging very difficult.  Use this helper
 * inside API route handlers whenever you need to return a non-2xx status to a
 * cross-origin caller.
 *
 * @example
 * if (!session) {
 *   return corsErrorResponse(request, 'Unauthorized', 401);
 * }
 */
export function corsErrorResponse(
  request: NextRequest,
  message: string,
  status: number
): NextResponse {
  const allowedOrigin = getAllowedOrigin(request);
  const response = NextResponse.json({ message }, { status });
  return applyCorsHeaders(response, allowedOrigin);
}
