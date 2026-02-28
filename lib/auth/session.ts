import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from './config';

/**
 * Get the current session from Better Auth
 * Returns null if no session exists
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

/**
 * Require authentication for a route
 * Redirects to login page if not authenticated
 * Returns the session if authenticated
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return session;
}

/**
 * Require admin role for a route
 * Redirects to login if not authenticated
 * Redirects to home if not admin
 * Returns the session if admin
 */
export async function requireAdmin() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Type assertion for role field
  const userRole = (session.user as any).role;
  if (userRole !== 'ADMIN') {
    redirect('/');
  }

  return session;
}
