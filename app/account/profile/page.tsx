import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ChangePasswordForm } from '@/components/account/change-password-form';
import { AccountMobileNav } from '@/components/account/mobile-nav';
import { ProfileForm } from '@/components/account/profile-form';
import { auth } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  return (
    <>
      <AccountMobileNav />
      <ProfileForm user={session.user} />
      <ChangePasswordForm />
    </>
  );
}
