import { LayoutDashboard, LogOut, Package, Settings, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { requireAdmin } from '@/lib/auth/session';

export const metadata = {
  title: 'Admin Panel - Doon Gooseberry Farm',
  description: 'Manage products, orders, and customers',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Require admin authentication
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500 mt-1">Doon Farm</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <NavLink href="/admin" icon={<LayoutDashboard className="w-5 h-5" />}>
              Dashboard
            </NavLink>
            <NavLink href="/admin/products" icon={<Package className="w-5 h-5" />}>
              Products
            </NavLink>
            <NavLink href="/admin/orders" icon={<ShoppingCart className="w-5 h-5" />}>
              Orders
            </NavLink>
            <NavLink href="/admin/settings" icon={<Settings className="w-5 h-5" />}>
              Settings
            </NavLink>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
              <p className="text-xs text-gray-500">{session.user.email}</p>
            </div>
            <form action="/api/auth/sign-out" method="POST">
              <Button type="submit" variant="outline" className="w-full justify-start" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      {icon}
      <span className="font-medium">{children}</span>
    </Link>
  );
}
