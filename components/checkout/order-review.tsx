'use client';

import { Edit, Loader2, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { validateCoupon } from '@/lib/actions/coupons';
import { type CartWithItems, type Coupon, calculateCartTotals } from '@/lib/utils/cart';
import { formatPrice } from '@/lib/utils/price';

interface OrderReviewProps {
  cart: CartWithItems;
}

interface Address {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export function OrderReview({ cart }: OrderReviewProps) {
  const router = useRouter();
  const [address, setAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Load address from sessionStorage
  useEffect(() => {
    const savedAddress = sessionStorage.getItem('checkoutAddress');
    if (savedAddress) {
      setAddress(JSON.parse(savedAddress));
    } else {
      // If no address, redirect back to step 1
      router.push('/checkout?step=1');
    }
  }, [router]);

  // Calculate totals
  const totals = calculateCartTotals(cart.items, appliedCoupon || undefined);

  // Handle apply coupon
  async function handleApplyCoupon() {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const result = await validateCoupon(couponCode.trim(), totals.subtotal);

      if (result.success && result.data) {
        setAppliedCoupon(result.data);
        // Store coupon in sessionStorage for payment step
        sessionStorage.setItem('appliedCoupon', JSON.stringify(result.data));
        toast.success(result.message || 'Coupon applied successfully');
      } else {
        toast.error(result.message || 'Invalid coupon code');
      }
    } catch (error) {
      toast.error('Failed to apply coupon. Please try again.');
    } finally {
      setIsApplyingCoupon(false);
    }
  }

  // Handle remove coupon
  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode('');
    sessionStorage.removeItem('appliedCoupon');
    toast.success('Coupon removed');
  }

  // Handle continue to payment
  function handleContinue() {
    setIsLoading(true);
    router.push('/checkout?step=3');
  }

  // Handle edit address
  function handleEditAddress() {
    router.push('/checkout?step=1');
  }

  if (!address) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cart Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Items</CardTitle>
            <Link href="/cart">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Cart
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                {/* Product Image */}
                <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{item.product.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.product.category?.name}</p>
                  <p className="text-sm mt-1">
                    Quantity: {item.quantity} × {formatPrice(item.product.price)}
                  </p>
                </div>

                {/* Item Subtotal */}
                <div className="text-right">
                  <p className="font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Shipping Address</CardTitle>
            <Button variant="outline" size="sm" onClick={handleEditAddress}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="font-medium">{address.name}</p>
            <p className="text-sm text-muted-foreground">{address.addressLine1}</p>
            {address.addressLine2 && (
              <p className="text-sm text-muted-foreground">{address.addressLine2}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {address.city}, {address.state} - {address.pincode}
            </p>
            <p className="text-sm text-muted-foreground">Phone: {address.phone}</p>
          </div>
        </CardContent>
      </Card>

      {/* Coupon Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Apply Coupon
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
              <div>
                <p className="font-medium text-green-800">{appliedCoupon.code}</p>
                <p className="text-sm text-green-600">
                  {appliedCoupon.discountType === 'PERCENTAGE'
                    ? `${appliedCoupon.discountValue}% off`
                    : `${formatPrice(appliedCoupon.discountValue)} off`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveCoupon}
                className="text-green-800 hover:text-green-900"
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={isApplyingCoupon}
              />
              <Button onClick={handleApplyCoupon} disabled={isApplyingCoupon || !couponCode.trim()}>
                {isApplyingCoupon ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  'Apply'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {totals.shipping === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  formatPrice(totals.shipping)
                )}
              </span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-green-600">-{formatPrice(totals.discount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatPrice(totals.total)}</span>
            </div>
          </div>

          {/* Free Shipping Message */}
          {totals.subtotal < 50000 && (
            <p className="text-xs text-muted-foreground mt-4">
              Add {formatPrice(50000 - totals.subtotal)} more for free shipping
            </p>
          )}
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button size="lg" onClick={handleContinue} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Continue to Payment'}
        </Button>
      </div>
    </div>
  );
}
