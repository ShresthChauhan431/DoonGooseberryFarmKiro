import { redirect } from 'next/navigation';
import { AddressForm } from '@/components/checkout/address-form';
import { CheckoutSteps } from '@/components/checkout/checkout-steps';
import { OrderReview } from '@/components/checkout/order-review';
import { PaymentForm } from '@/components/checkout/payment-form';
import { requireAuth } from '@/lib/auth/session';
import { getCart } from '@/lib/queries/cart';

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Progress Steps */}
      <CheckoutSteps currentStep={validStep} />

      {/* Step Content */}
      <div className="mt-8">
        {validStep === 1 && <AddressForm />}
        {validStep === 2 && <OrderReview cart={cart} />}
        {validStep === 3 && <PaymentForm cart={cart} />}
      </div>
    </div>
  );
}
