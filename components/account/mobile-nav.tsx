'use client';

import { Heart, MapPin, Package, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const navItems = [
  {
    title: 'My Orders',
    href: '/account',
    icon: Package,
  },
  {
    title: 'Addresses',
    href: '/account/addresses',
    icon: MapPin,
  },
  {
    title: 'Profile',
    href: '/account/profile',
    icon: User,
  },
  {
    title: 'Wishlist',
    href: '/account/wishlist',
    icon: Heart,
  },
];

export function AccountMobileNav() {
  const pathname = usePathname();

  const getCurrentTitle = () => {
    const item = navItems.find((item) => {
      if (item.href === '/account') {
        return pathname === '/account';
      }
      return pathname.startsWith(item.href);
    });
    return item?.title || 'My Account';
  };

  return (
    <div className="lg:hidden mb-6">
      <Select value={pathname} onValueChange={(v) => (window.location.href = v)}>
        <SelectTrigger className="w-full">
          <SelectValue>{getCurrentTitle()}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <SelectItem key={item.href} value={item.href}>
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  {item.title}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
