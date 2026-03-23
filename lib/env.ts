import { z } from 'zod';

const envSchema = z.object({
  // ── Database ───────────────────────────────────────────────────────────────
  DATABASE_URL: z.string().min(1),

  // ── Authentication ─────────────────────────────────────────────────────────
  AUTH_SECRET: z.string().min(32),

  /**
   * The canonical URL of the API / Better Auth server.
   * Server-side only — never exposed to the browser.
   *
   * Same-origin deployment  → https://doon-gooseberry-farm.vercel.app
   * Cross-origin deployment → https://doon-gooseberry-farm-kiro.vercel.app
   */
  AUTH_URL: z.string().url(),

  /**
   * Client-side copy of AUTH_URL.
   * Prefixed with NEXT_PUBLIC_ so Next.js inlines it into the browser bundle.
   * Must equal AUTH_URL in a same-origin deployment.
   */
  NEXT_PUBLIC_AUTH_URL: z.string().url(),

  // ── App / Frontend URL ─────────────────────────────────────────────────────
  /**
   * The public URL of the frontend deployment.
   * Used for:
   *   • CORS allow-list  (lib/cors.ts, lib/auth/config.ts → trustedOrigins)
   *   • Better Auth cookie domain detection
   *   • SEO / Open Graph metadata
   *   • Sitemap base URL
   *   • Structured-data (schema.org) URLs
   *
   * Set this to the NEW frontend domain:
   *   https://doon-gooseberry-farm.vercel.app
   *
   * In a same-origin deployment this will equal AUTH_URL / NEXT_PUBLIC_AUTH_URL.
   */
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // ── CORS extras ────────────────────────────────────────────────────────────
  /**
   * Comma-separated list of additional allowed origins for CORS / trustedOrigins.
   * Useful for Vercel preview deployments, staging environments, etc.
   *
   * Example:
   *   CORS_ADDITIONAL_ORIGINS="https://pr-42-acme.vercel.app,https://staging.acme.com"
   */
  CORS_ADDITIONAL_ORIGINS: z.string().optional(),

  // ── Razorpay (payment gateway) ─────────────────────────────────────────────
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),

  // ── Email — Resend ─────────────────────────────────────────────────────────
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),

  // ── Storage — Vercel Blob ──────────────────────────────────────────────────
  BLOB_READ_WRITE_TOKEN: z.string().optional(),

  // ── Storage — Cloudflare R2 (alternative) ─────────────────────────────────
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),

  // ── Rate Limiting — Upstash Redis ──────────────────────────────────────────
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // ── Google OAuth (social login) ────────────────────────────────────────────
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // ── Monitoring — Sentry ────────────────────────────────────────────────────
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // ── Runtime ────────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);
