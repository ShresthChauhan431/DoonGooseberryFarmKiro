import { AlertTriangle, DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAdminStats } from '@/lib/queries/orders';
import { formatPrice } from '@/lib/utils/price';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your store's performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today's Orders */}
        <StatsCard
          title="Today's Orders"
          value={stats.todayOrders.toString()}
          icon={<ShoppingCart className="w-5 h-5" />}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />

        {/* Today's Revenue */}
        <StatsCard
          title="Today's Revenue"
          value={formatPrice(stats.todayRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />

        {/* Week's Orders */}
        <StatsCard
          title="This Week's Orders"
          value={stats.weekOrders.toString()}
          icon={<ShoppingCart className="w-5 h-5" />}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />

        {/* Week's Revenue */}
        <StatsCard
          title="This Week's Revenue"
          value={formatPrice(stats.weekRevenue)}
          icon={<TrendingUp className="w-5 h-5" />}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />

        {/* Month's Orders */}
        <StatsCard
          title="This Month's Orders"
          value={stats.monthOrders.toString()}
          icon={<ShoppingCart className="w-5 h-5" />}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-100"
        />

        {/* Month's Revenue */}
        <StatsCard
          title="This Month's Revenue"
          value={formatPrice(stats.monthRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
      </div>

      {/* Low Stock Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Low Stock Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">All products have sufficient stock</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="font-medium text-gray-900 hover:text-green-600"
                    >
                      {product.name}
                    </Link>
                    <p className="text-sm text-gray-500">{formatPrice(product.price)}</p>
                  </div>
                  <Badge variant={product.stock === 0 ? 'destructive' : 'secondary'}>
                    {product.stock === 0 ? 'Out of Stock' : `${product.stock} units`}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <p className="text-gray-500 text-sm">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-gray-900 hover:text-green-600"
                    >
                      Order #{String(order.id)}
                    </Link>
                    <p className="text-sm text-gray-500">{order.user.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">
                      {formatPrice(order.total ?? 0)}
                    </span>
                    <StatusBadge status={order.status ?? 'PENDING'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  iconColor,
  iconBg,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${iconBg} ${iconColor}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: any; label: string }> = {
    PENDING: { variant: 'secondary', label: 'Pending' },
    PROCESSING: { variant: 'default', label: 'Processing' },
    SHIPPED: { variant: 'default', label: 'Shipped' },
    DELIVERED: { variant: 'default', label: 'Delivered' },
    CANCELLED: { variant: 'destructive', label: 'Cancelled' },
  };

  const config = variants[status] || variants.PENDING;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
