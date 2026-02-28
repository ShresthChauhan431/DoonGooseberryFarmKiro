'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';

/**
 * Logout action - invalidates the current session and redirects to homepage
 */
export async function logout() {
  try {
    // Sign out using Better Auth
    await auth.api.signOut({
      headers: await headers(),
    });

    // Redirect to homepage
    redirect('/');
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error('Failed to logout');
  }
}
