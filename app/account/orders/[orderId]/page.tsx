import { CheckCircle2, Circle, Home, Package, Truck } from 'lucide-react';
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/lib/auth/config';
import { getEstimatedDeliveryDate, getOrderById } from '@/lib/queries/orders';
import { formatPrice } from '@/lib/utils/price';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  PROCESSING: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  SHIPPED: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  DELIVERED: 'bg-green-100 text-green-800 hover:bg-green-100',
  CANCELLED: 'bg-red-100 text-red-800 hover:bg-red-100',
} as const;

interface StatusTimelineProps {
  currentStatus: string;
}

function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  const statuses = [
    { key: 'PENDING', label: 'Order Placed', icon: Package },
    { key: 'PROCESSING', label: 'Processing', icon: Package },
    { key: 'SHIPPED', label: 'Shipped', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: Home },
  ];

  const statusIndex = statuses.findIndex((s) => s.key === currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <Circle className="h-5 w-5" />
        <span className="font-medium">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      {statuses.map((status, index) => {
        const Icon = status.icon;
        const isCompleted = index <= statusIndex;
        const isCurrent = index === statusIndex;

        return (
          <div key={status.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <p
                className={`mt-2 text-xs text-center ${
                  isCurrent ? 'font-semibold' : 'text-muted-foreground'
                }`}
              >
                {status.label}
              </p>
            </div>
            {index < statuses.length - 1 && (
              <div className={`flex-1 h-1 mx-2 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  // Verify order belongs to authenticated user
  if (order.userId !== session.user.id) {
    // Return 403 forbidden
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to view this order.</p>
            <Link href="/account" className="text-primary hover:underline mt-4 inline-block">
              Back to My Orders
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const estimatedDelivery = getEstimatedDeliveryDate(
    order.createdAt ?? new Date(),
    order.status ?? 'PENDING'
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/account"
        className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block"
      >
        ← Back to My Orders
      </Link>

      <div className="space-y-6">
        {/* Order Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Order #{String(order.id)}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Placed on{' '}
                  {new Date(order.createdAt ?? new Date()).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <Badge
                className={statusColors[(order.status ?? 'PENDING') as keyof typeof statusColors]}
              >
                {order.status ?? 'PENDING'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <StatusTimeline currentStatus={order.status ?? 'PENDING'} />
            {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
              <p className="text-sm text-muted-foreground mt-4">
                Estimated Delivery: {estimatedDelivery}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                >
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={item.product?.images?.[0] ?? '/images/placeholder.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/shop/${item.product.slug}`}
                      className="font-medium hover:text-primary"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(item.price ?? 0)}</p>
                    <p className="text-sm text-muted-foreground">
                      Subtotal: {formatPrice((item.price ?? 0) * (item.quantity ?? 0))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}
                </p>
                <p>{order.shippingAddress?.pincode}</p>
                <p>Phone: {order.shippingAddress?.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shipping ?? 0)}</span>
                </div>
                {(order.discount ?? 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                    <span>-{formatPrice(order.discount ?? 0)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{formatPrice(order.total ?? 0)}</span>
                </div>
                <Separator className="my-3" />
                <div className="space-y-1 text-muted-foreground">
                  <p>Payment Method: Razorpay</p>
                  {order.razorpayPaymentId && (
                    <p className="text-xs">Transaction ID: {order.razorpayPaymentId}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
