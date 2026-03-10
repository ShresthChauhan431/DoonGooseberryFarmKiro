/**
 * Better Auth type extensions
 *
 * The `role` field on session.user is automatically inferred by Better Auth
 * from the `additionalFields` configuration in lib/auth/config.ts.
 *
 * No manual module augmentation is needed — Better Auth's `$Infer.Session`
 * type already includes `role` based on the auth config.
 *
 * This file is kept as a reference and to re-export the inferred session type.
 */

export type { Session } from './config';
