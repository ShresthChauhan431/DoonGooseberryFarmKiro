import { ArrowLeft } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth } from '@/lib/auth/config';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  // Verify authentication (middleware already protects, but double-check)
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
        <h1 className="text-3xl font-bold">My Account</h1>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="orders" asChild>
            <Link href="/account">My Orders</Link>
          </TabsTrigger>
          <TabsTrigger value="addresses" asChild>
            <Link href="/account/addresses">Addresses</Link>
          </TabsTrigger>
          <TabsTrigger value="profile" asChild>
            <Link href="/account/profile">Profile Settings</Link>
          </TabsTrigger>
          <TabsTrigger value="wishlist" asChild>
            <Link href="/account/wishlist">Wishlist</Link>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">{children}</div>
      </Tabs>
    </div>
  );
}
