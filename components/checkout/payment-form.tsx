'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { createRazorpayOrderAction, verifyPaymentAndCreateOrder } from '@/lib/actions/orders';
import { type CartWithItems, type Coupon, calculateCartTotals } from '@/lib/utils/cart';
import { formatPrice } from '@/lib/utils/price';

interface PaymentFormProps {
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

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PaymentForm({ cart }: PaymentFormProps) {
  const router = useRouter();
  const [address, setAddress] = useState<Address | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Calculate totals
  const totals = calculateCartTotals(cart.items, appliedCoupon || undefined);

  // Load address from sessionStorage
  useEffect(() => {
    const savedAddress = sessionStorage.getItem('checkoutAddress');
    if (savedAddress) {
      setAddress(JSON.parse(savedAddress));
    } else {
      // If no address, redirect back to step 1
      router.push('/checkout?step=1');
    }

    // Load applied coupon from sessionStorage
    const savedCoupon = sessionStorage.getItem('appliedCoupon');
    if (savedCoupon) {
      setAppliedCoupon(JSON.parse(savedCoupon));
    }
  }, [router]);

  // Load Razorpay SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handle payment
  async function handlePayment() {
    if (!address) {
      toast.error('Shipping address not found');
      return;
    }

    if (!isScriptLoaded) {
      toast.error('Payment gateway is loading. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      // Create Razorpay order
      const result = await createRazorpayOrderAction(totals.total);

      if (!result.success || !result.data) {
        toast.error(result.message || 'Failed to create payment order');
        setIsLoading(false);
        return;
      }

      const { orderId, amount, currency, keyId } = result.data;

      // Configure Razorpay options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'Doon Gooseberry Farm',
        description: 'Order Payment',
        order_id: orderId,
        handler: async (response: any) => {
          // Payment successful, verify and create order
          const verifyResult = await verifyPaymentAndCreateOrder(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            address,
            appliedCoupon?.code
          );

          if (verifyResult.success) {
            // Clear address and coupon from sessionStorage
            sessionStorage.removeItem('checkoutAddress');
            sessionStorage.removeItem('appliedCoupon');

            // Redirect to success page
            router.push(`/order/${verifyResult.data.orderId}/success`);
          } else {
            toast.error(verifyResult.message || 'Payment verification failed');
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
        prefill: {
          name: address.name,
          contact: address.phone,
        },
        theme: {
          color: '#10b981', // Primary color
        },
      };

      // Open Razorpay payment modal
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setIsLoading(false);
    }
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
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
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
              <span>Total Amount</span>
              <span>{formatPrice(totals.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You will be redirected to Razorpay secure payment gateway to complete your purchase.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Accepted payment methods:</span>
              <span className="font-medium">
                Credit Card, Debit Card, UPI, Net Banking, Wallets
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pay Button */}
      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handlePayment}
          disabled={isLoading || !isScriptLoaded}
          className="min-w-[200px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${formatPrice(totals.total)}`
          )}
        </Button>
      </div>

      {/* Security Note */}
      <p className="text-xs text-center text-muted-foreground">
        Your payment information is secure and encrypted. We do not store your card details.
      </p>
    </div>
  );
}
