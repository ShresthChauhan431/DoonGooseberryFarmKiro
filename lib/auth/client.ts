import { createAuthClient } from 'better-auth/react';

/**
 * lib/auth/client.ts
 *
 * Better Auth browser client — the single entry-point for all client-side
 * authentication calls (sign-in, sign-up, sign-out, session hooks, etc.).
 *
 * ── baseURL strategy ───────────────────────────────────────────────────────
 *
 * Root cause of the CORS error
 * -----------------------------
 * NEXT_PUBLIC_* variables are inlined into the JavaScript bundle at BUILD
 * time by Next.js.  If NEXT_PUBLIC_AUTH_URL was set to the OLD deployment
 * domain (https://doon-gooseberry-farm-kiro.vercel.app) when the project was
 * built, every auth call from the NEW frontend domain will be sent to the old
 * domain — a cross-origin request — even though the new deployment hosts the
 * very same /api/auth/* routes.
 *
 * The fix
 * -------
 * In the browser we derive baseURL from window.location.origin at RUNTIME.
 * This guarantees that auth calls always go to the SAME domain the user is
 * currently browsing, making them same-origin by definition.
 *
 * Same-origin requests:
 *   • Never trigger CORS preflight
 *   • Always attach cookies (SameSite=Lax is fine)
 *   • Are unaffected by CORS allow-lists / trustedOrigins mismatches
 *
 * During SSR (window is undefined)
 * ---------------------------------
 * createAuthClient is called at module level, outside any React component or
 * effect.  On the server window does not exist, so we fall back to env vars:
 *
 *   NEXT_PUBLIC_APP_URL   — the new canonical frontend URL (preferred)
 *   NEXT_PUBLIC_AUTH_URL  — legacy / alias (accepted as fallback)
 *   http://localhost:3000 — last-resort for local development
 *
 * Server-side auth calls (getSession, signOut inside Server Actions, etc.)
 * go through auth.api.* in lib/auth/config.ts — not through this client —
 * so the SSR fallback path is only exercised during pre-rendering and is
 * harmless.
 *
 * ── credentials: "include" ─────────────────────────────────────────────────
 *
 * Even though same-origin calls are the goal, we set credentials: "include"
 * as a defensive measure for any scenario where the origins legitimately
 * differ (e.g. a Vercel preview deployment calling a shared API deployment).
 *
 * Without this option the browser uses the default credentials: "same-origin"
 * behaviour, which silently drops cookies on cross-origin requests.  That
 * means:
 *   1. The session cookie returned by a sign-in response is never stored.
 *   2. Every subsequent request looks unauthenticated to the server.
 *   3. The only symptom is a redirect to /login with no error message.
 *
 * Setting credentials: "include" works in tandem with three other settings:
 *   • Access-Control-Allow-Credentials: true        (lib/cors.ts)
 *   • Access-Control-Allow-Origin: <exact origin>   (lib/cors.ts — never "*")
 *   • SameSite=None; Secure on the session cookie   (lib/auth/config.ts)
 *
 * All four must be present simultaneously for cross-origin auth to work.
 * Any one missing causes silent failure.
 */

/**
 * Resolve the base URL for the auth client.
 *
 * Priority order:
 *   1. window.location.origin  — runtime browser origin (same-origin guarantee)
 *   2. NEXT_PUBLIC_APP_URL     — new canonical frontend URL from env
 *   3. NEXT_PUBLIC_AUTH_URL    — legacy env var (may point to old domain)
 *   4. http://localhost:3000   — local development fallback
 *
 * The typeof check is necessary because this module is evaluated during SSR
 * where the global `window` object does not exist.
 */
function resolveBaseURL(): string {
  // ── Runtime: always use the current page's origin ──────────────────────────
  // This is the key fix: regardless of what any env var is set to, the auth
  // client will call the domain the browser is already on.
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // ── Build / SSR fallback: use env vars ─────────────────────────────────────
  // These paths are only hit during Next.js server-side rendering and static
  // generation, not during interactive browser use.

  // Prefer the explicit app URL (the new frontend domain)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '');
  }

  // Accept the auth URL as a legacy fallback
  if (process.env.NEXT_PUBLIC_AUTH_URL) {
    return process.env.NEXT_PUBLIC_AUTH_URL.replace(/\/+$/, '');
  }

  // Last resort for local development without any env vars configured
  return 'http://localhost:3000';
}

export const authClient = createAuthClient({
  /**
   * The URL that Better Auth sends all /api/auth/* requests to.
   *
   * Resolved at module load time:
   *   • In the browser  → window.location.origin  (same-origin, no CORS)
   *   • During SSR      → NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_AUTH_URL
   */
  baseURL: resolveBaseURL(),

  fetchOptions: {
    /**
     * "include" instructs the browser to:
     *   1. Send the session cookie with every request to baseURL, even when
     *      the page origin and baseURL differ (cross-origin scenario).
     *   2. Accept and store the Set-Cookie header from sign-in responses.
     *
     * This is safe to set unconditionally:
     *   • Same-origin requests — behaves identically to "same-origin".
     *   • Cross-origin requests — required for cookies to work at all.
     *
     * The corresponding server-side requirements are:
     *   Access-Control-Allow-Credentials: true   → lib/cors.ts
     *   Access-Control-Allow-Origin: <origin>    → lib/cors.ts (not "*")
     *   SameSite=None; Secure                    → lib/auth/config.ts
     */
    credentials: 'include' as RequestCredentials,
  },
});

// ── Named exports ─────────────────────────────────────────────────────────────
// Re-export the most-used methods individually so call-sites can import only
// what they need, enabling tree-shaking in production bundles.

export const { useSession, signIn, signOut, signUp } = authClient;
