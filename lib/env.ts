import { z } from 'zod';

const envSchema = z.object({
  // =========================
  // Core (Required)
  // =========================

  DATABASE_URL: z.string().min(1),

  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),

  AUTH_URL: z.string().url(),

  NEXT_PUBLIC_AUTH_URL: z.string().url(),

  // =========================
  // Payments (Optional)
  // =========================

  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),

  // =========================
  // Email (Optional)
  // =========================

  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),

  // =========================
  // Storage (Optional)
  // =========================

  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),

  // =========================
  // Rate Limiting (Optional)
  // =========================

  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // =========================
  // Monitoring (Optional)
  // =========================

  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // =========================
  // Environment
  // =========================

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);
