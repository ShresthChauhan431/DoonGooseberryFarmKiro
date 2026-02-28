import crypto from 'node:crypto';
import Razorpay from 'razorpay';

/**
 * Initialize Razorpay instance with API credentials
 * This should only be used on the server side
 */
function getRazorpayInstance() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured');
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * Create a Razorpay order
 * @param amount - Order amount in paise (1 rupee = 100 paise)
 * @returns Razorpay order object with order ID
 */
export async function createRazorpayOrder(amount: number) {
  const razorpay = getRazorpayInstance();

  const order = await razorpay.orders.create({
    amount: amount, // amount in paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  });

  return order;
}

/**
 * Verify Razorpay payment signature
 * This ensures the payment callback is authentic and not tampered with
 * @param orderId - Razorpay order ID
 * @param paymentId - Razorpay payment ID
 * @param signature - Razorpay signature from callback
 * @returns true if signature is valid, false otherwise
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay secret key not configured');
  }

  // Create the expected signature
  const text = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');

  // Compare signatures
  const isValid = generatedSignature === signature;

  // Log invalid signatures for security monitoring
  if (!isValid) {
    console.error('Invalid payment signature detected', {
      orderId,
      paymentId,
      providedSignature: signature.substring(0, 10) + '...',
    });
  }

  return isValid;
}

/**
 * Get Razorpay public key for client-side usage
 * This is safe to expose to the client
 */
export function getRazorpayKeyId(): string {
  if (!process.env.RAZORPAY_KEY_ID) {
    throw new Error('Razorpay key ID not configured');
  }
  return process.env.RAZORPAY_KEY_ID;
}
