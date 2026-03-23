import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';

// ─── Cross-origin detection ───────────────────────────────────────────────────
//
// When the frontend and the API live on different Vercel domains we are in a
// cross-origin setup and every auth cookie must carry SameSite=None; Secure.
//
// Why SameSite=None?
// ------------------
// SameSite=Lax (the browser default) silently drops cookies on cross-origin
// POST requests.  A sign-in call IS a cross-origin POST, so the server's
// Set-Cookie response is ignored and the session is never persisted in the
// browser — even after CORS headers are fully correct.
//
// Why is SameSite=None safe here?
// --------------------------------
// Better Auth enforces its own CSRF protection through the `trustedOrigins`
// allow-list (Origin header checked on every state-changing request).  That
// protection is independent of the SameSite attribute, so moving to None does
// not regress CSRF security.
//
// Condition
// ---------
// We only activate None in production AND when the frontend URL differs from
// the API URL.  In local development both services run on localhost so the
// Lax default is fine and the Secure flag is not required (HTTP is acceptable
// on localhost).

const isProduction = process.env.NODE_ENV === 'production';

/** Normalise: strip trailing slashes so comparisons are reliable. */
function normalise(url: string | undefined): string {
  return (url ?? '').replace(/\/+$/, '');
}

const appUrl = normalise(process.env.NEXT_PUBLIC_APP_URL); // frontend domain
const authUrl = normalise(process.env.AUTH_URL) || 'http://localhost:3000'; // API domain

/**
 * True when the frontend deployment URL is different from the API URL.
 * This is the canonical signal for "we are in a cross-origin setup".
 */
const isCrossOrigin = isProduction && appUrl !== '' && appUrl !== authUrl;

// ─── Trusted-origins builder ─────────────────────────────────────────────────
//
// Better Auth checks the `Origin` request header against this list before
// processing ANY state-changing operation (sign-in, sign-up, sign-out,
// password change, …).  An origin not present here receives a 403 immediately
// — before your route handler runs and before CORS headers are ever attached.
//
// This is the PRIMARY reason the CORS error appears even after middleware is
// fixed: Better Auth's own gate rejects the request silently.
//
// Origins included:
//   AUTH_URL              — the API server itself (same-origin SSR calls)
//   NEXT_PUBLIC_APP_URL   — the frontend deployment (cross-origin browser calls)
//   NEXT_PUBLIC_AUTH_URL  — client-side alias; include both spellings
//   CORS_ADDITIONAL_ORIGINS — comma-separated extras: preview URLs, staging, …
//   localhost variants    — always allowed in development

function buildTrustedOrigins(): string[] {
  const origins: (string | undefined)[] = [
    authUrl,
    appUrl || undefined,
    normalise(process.env.NEXT_PUBLIC_AUTH_URL) || undefined,
  ];

  // Comma-separated extras: "https://pr-42.vercel.app,https://staging.example.com"
  const extras = process.env.CORS_ADDITIONAL_ORIGINS;
  if (extras) {
    const extraOrigins = extras
      .split(',')
      .map((s) => s.trim().replace(/\/+$/, ''))
      .filter(Boolean);
    for (const o of extraOrigins) {
      origins.push(o);
    }
  }

  // Always allow localhost in non-production environments
  if (!isProduction) {
    origins.push('http://localhost:3000', 'http://localhost:3001');
  }

  // Deduplicate and remove empties
  return [...new Set(origins.filter((o): o is string => Boolean(o)))];
}

// ─── Better Auth configuration ────────────────────────────────────────────────

export const auth = betterAuth({
  // ── Database adapter ───────────────────────────────────────────────────────
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  // ── Email + password ───────────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  // ── Email verification ─────────────────────────────────────────────────────
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      // Lazy imports keep this module lightweight and avoid circular deps
      const { sendEmail } = await import('@/lib/email/send');
      const { VerifyEmail } = await import('@/lib/email/templates/verify-email');

      await sendEmail({
        to: user.email,
        subject: 'Verify your email - Doon Gooseberry Farm',
        react: VerifyEmail({
          userName: user.name || 'Customer',
          verificationUrl: url,
        }),
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },

  // ── Social providers ───────────────────────────────────────────────────────
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },

  // ── Custom user fields ─────────────────────────────────────────────────────
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'USER',
      },
    },
  },

  // ── Session ────────────────────────────────────────────────────────────────
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 min — refresh from DB if older
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // extend session if older than 1 day

    cookieOptions: {
      // Prevent JavaScript from reading the cookie (XSS mitigation).
      httpOnly: true,

      // Transmit over HTTPS only in production.
      secure: isProduction,

      // ── SameSite policy ────────────────────────────────────────────────────
      //
      // isCrossOrigin = true  (prod, different frontend/API domains)
      //   → 'none'  The browser sends the cookie on cross-origin requests.
      //             Requires secure: true (enforced above in production).
      //             CSRF protection is provided by Better Auth's trustedOrigins.
      //
      // isCrossOrigin = false  (dev, or both services on the same domain)
      //   → 'lax'   Browser default; provides additional CSRF protection at
      //             the browser level.  No change from the original config.
      sameSite: isCrossOrigin ? 'none' : 'lax',

      path: '/',
    },
  },

  // ── Core settings ──────────────────────────────────────────────────────────

  secret: process.env.AUTH_SECRET || '',

  /**
   * The canonical URL of THIS Better Auth deployment (the API server).
   * Used internally to build callback URLs, email links, OAuth redirect URIs,
   * and cookie domains.
   *
   * Must be updated in Vercel env vars when the deployment domain changes:
   *   AUTH_URL=https://doon-gooseberry-farm.vercel.app
   */
  baseURL: authUrl,

  /**
   * CORS / CSRF origin allow-list.
   *
   * Better Auth checks the `Origin` header of every mutation request against
   * this list.  Any origin not listed here is rejected with 403 before the
   * route handler runs — this is why CORS middleware alone is insufficient.
   *
   * Driven entirely by environment variables (see buildTrustedOrigins above).
   * Add new origins via CORS_ADDITIONAL_ORIGINS without touching this file.
   */
  trustedOrigins: buildTrustedOrigins(),

  // ── Advanced ───────────────────────────────────────────────────────────────
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
});

export type Session = typeof auth.$Infer.Session;
