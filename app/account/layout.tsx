import { ArrowLeft } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AccountSidebar } from '@/components/account/sidebar';
import { UserHeader } from '@/components/account/user-header';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth/config';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/" aria-label="Back to home">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">My Account</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <UserHeader
              name={session.user.name || 'User'}
              email={session.user.email}
              image={session.user.image ?? undefined}
            />
            <AccountSidebar />
          </div>
        </div>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
