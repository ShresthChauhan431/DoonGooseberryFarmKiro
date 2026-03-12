import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      // Lazy import to avoid circular dependencies and keep this module lightweight
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
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'USER',
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieOptions: {
      httpOnly: true, // Prevents JavaScript access to cookies
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax', // CSRF protection
      path: '/',
    },
  },
  secret: process.env.AUTH_SECRET || '',
  baseURL: process.env.AUTH_URL || 'http://localhost:3000',
  trustedOrigins: [process.env.AUTH_URL || 'http://localhost:3000'],
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
});

export type Session = typeof auth.$Infer.Session;
