'use client';

import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { authClient } from '@/lib/auth/client';
import type { Session } from '@/lib/auth/config';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
}

interface MobileNavProps {
  categories: Category[];
  session: Session | null;
}

/**
 * Mobile navigation drawer component
 * Displays category navigation and user menu items
 * Only shown on screens < 768px
 */
export function MobileNav({ categories, session }: MobileNavProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await authClient.signOut();

      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });

      router.push('/');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* User section */}
      <div className="flex flex-col gap-3 pb-6 border-b">
        {session ? (
          <div className="flex items-center gap-2 px-2">
            <User className="h-5 w-5" />
            <span className="text-sm font-medium">{session.user.name}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Register</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Navigation links */}
      <nav className="flex flex-col gap-4">
        <Link
          href="/shop"
          className="text-base font-medium transition-colors hover:text-primary px-2"
        >
          All Products
        </Link>

        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.slug}`}
            className="text-base font-medium transition-colors hover:text-primary px-2"
          >
            {category.name}
          </Link>
        ))}

        <Link
          href="/blog"
          className="text-base font-medium transition-colors hover:text-primary px-2"
        >
          Blog
        </Link>
      </nav>

      {/* Additional menu items for authenticated users */}
      {session && (
        <div className="flex flex-col gap-4 pt-6 border-t">
          <Link
            href="/account"
            className="text-base font-medium transition-colors hover:text-primary px-2"
          >
            My Account
          </Link>
          <Link
            href="/account/orders"
            className="text-base font-medium transition-colors hover:text-primary px-2"
          >
            My Orders
          </Link>
          <Link
            href="/account/wishlist"
            className="text-base font-medium transition-colors hover:text-primary px-2"
          >
            Wishlist
          </Link>
          {session.user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="text-base font-medium transition-colors hover:text-primary px-2"
            >
              Admin Panel
            </Link>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="justify-start px-2 text-red-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
