import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/account/profile-form';
import { auth } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Profile Settings</h2>
      <ProfileForm user={session.user} />
    </div>
  );
}
