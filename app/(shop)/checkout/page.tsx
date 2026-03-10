import { redirect } from 'next/navigation';
import { AddressForm } from '@/components/checkout/address-form';
import { CheckoutSteps } from '@/components/checkout/checkout-steps';
import { OrderReview } from '@/components/checkout/order-review';
import { PaymentForm } from '@/components/checkout/payment-form';
import { requireAuth } from '@/lib/auth/session';
import { getUserAddresses } from '@/lib/queries/addresses';
import { getCart } from '@/lib/queries/cart';
import { getCheckoutSession } from '@/lib/queries/checkout';
import { getDeliverySettings } from '@/lib/queries/settings';

export const dynamic = 'force-dynamic';

interface CheckoutPageProps {
  searchParams: Promise<{ step?: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  // Require authentication
  const session = await requireAuth();
  const params = await searchParams;

  // Get cart
  const cart = await getCart(session.user.id);

  // Validate cart is not empty
  if (!cart || cart.items.length === 0) {
    redirect('/cart');
  }

  // Get current step (default to 1)
  const step = Number.parseInt(params.step || '1', 10);
  const validStep = step >= 1 && step <= 3 ? step : 1;

  // If user tries to go to step 2 or 3 without an address, redirect to step 1
  const checkoutSession = await getCheckoutSession(session.user.id);
  if (validStep > 1 && !checkoutSession?.addressData) {
    redirect('/checkout?step=1');
  }

  // Fetch saved addresses for the user
  const savedAddresses = await getUserAddresses(session.user.id);

  // Fetch delivery settings server-side so shipping cost is authoritative
  const deliverySettings = await getDeliverySettings();
  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingCost =
    deliverySettings.freeDeliveryThreshold > 0 && subtotal >= deliverySettings.freeDeliveryThreshold
      ? 0
      : deliverySettings.standardDeliveryCharge;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Progress Steps */}
      <CheckoutSteps currentStep={validStep} />

      {/* Step Content */}
      <div className="mt-8">
        {validStep === 1 && (
          <AddressForm
            savedAddresses={savedAddresses}
            initialAddress={checkoutSession?.addressData ?? undefined}
          />
        )}
        {validStep === 2 && (
          <OrderReview
            cart={cart}
            shippingCost={shippingCost}
            freeDeliveryThreshold={deliverySettings.freeDeliveryThreshold}
            serverAddress={checkoutSession?.addressData ?? undefined}
            serverCoupon={checkoutSession?.appliedCoupon ?? undefined}
          />
        )}
        {validStep === 3 && (
          <PaymentForm
            cart={cart}
            shippingCost={shippingCost}
            serverAddress={checkoutSession?.addressData ?? undefined}
            serverCoupon={checkoutSession?.appliedCoupon ?? undefined}
          />
        )}
      </div>
    </div>
  );
}
