import { ArrowRight, Package } from 'lucide-react';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AccountMobileNav } from '@/components/account/mobile-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth/config';
import { getUserOrders } from '@/lib/queries/orders';
import { formatPrice } from '@/lib/utils/price';

export const dynamic = 'force-dynamic';

const statusConfig = {
  PENDING: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  PROCESSING: {
    label: 'Processing',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  SHIPPED: {
    label: 'Shipped',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  },
  DELIVERED: {
    label: 'Delivered',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
} as const;

export default async function MyOrdersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const orders = await getUserOrders(session.user.id);

  return (
    <div>
      <AccountMobileNav />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Package className="w-5 h-5" />
              My Orders
            </CardTitle>
            {orders.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">You haven&apos;t placed any orders yet.</p>
              <Button asChild>
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = (order.status ?? 'PENDING') as keyof typeof statusConfig;
                const config = statusConfig[status] || statusConfig.PENDING;

                return (
                  <Link key={order.id} href={`/account/orders/${order.id}`} className="block">
                    <div className="group border rounded-xl p-4 hover:shadow-md hover:border-primary/50 transition-all duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-semibold text-lg">Order #{String(order.id)}</span>
                            <Badge className={config.className}>{config.label}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Placed on{' '}
                            {new Date(order.createdAt ?? new Date()).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary">
                              {formatPrice(order.total ?? 0)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
