import { Calendar, CheckCircle2, MapPin, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getSession } from '@/lib/auth/session';
import { getEstimatedDeliveryDate, getOrderById } from '@/lib/queries/orders';
import { formatPrice } from '@/lib/utils/price';

interface OrderSuccessPageProps {
  params: {
    orderId: string;
  };
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const order = await getOrderById(params.orderId);

  if (!order) {
    notFound();
  }

  // Verify order belongs to user
  if (order.userId !== session.user.id) {
    notFound();
  }

  const estimatedDelivery = getEstimatedDeliveryDate(
    order.createdAt ?? new Date(),
    order.status ?? 'PENDING'
  );

  return (
    <div className="container max-w-4xl py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your order. We've received your payment and will start processing your order
          soon.
        </p>
      </div>

      {/* Order Details Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order Details</span>
            <span className="text-sm font-normal text-muted-foreground">
              Order #{String(order.id)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Items Ordered
            </h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={item.product?.images?.[0] ?? '/images/placeholder.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    <p className="text-sm font-medium mt-1">
                      {formatPrice(item.price ?? 0)} × {item.quantity} ={' '}
                      {formatPrice((item.price ?? 0) * (item.quantity ?? 0))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div>
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {(order.shipping ?? 0) === 0 ? 'FREE' : formatPrice(order.shipping ?? 0)}
                </span>
              </div>
              {(order.discount ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>-{formatPrice(order.discount ?? 0)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(order.total ?? 0)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Shipping Address */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Shipping Address
            </h3>
            <div className="text-sm space-y-1">
              <p className="font-medium">{order.shippingAddress?.name}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                {order.shippingAddress?.pincode}
              </p>
              <p>Phone: {order.shippingAddress?.phone}</p>
            </div>
          </div>

          <Separator />

          {/* Estimated Delivery */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Estimated Delivery
            </h3>
            <p className="text-sm">
              Your order is expected to arrive by{' '}
              <span className="font-semibold">{estimatedDelivery}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="outline">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
        <Button asChild>
          <Link href={`/account/orders/${order.id}`}>View Order Details</Link>
        </Button>
      </div>

      {/* Email Confirmation Notice */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        A confirmation email has been sent to your registered email address.
      </p>
    </div>
  );
}
