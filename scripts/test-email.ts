/**
 * Test script to verify Resend email service is working
 * Run with: tsx scripts/test-email.ts your-email@example.com
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { sendEmail } from '@/lib/email/send';
import { OrderConfirmationEmail } from '@/lib/email/templates/order-confirmation';

async function testEmail() {
  const testEmail = process.argv[2];

  if (!testEmail) {
    console.error('❌ Please provide an email address as argument');
    console.log('Usage: tsx scripts/test-email.ts your-email@example.com');
    process.exit(1);
  }

  console.log('📧 Testing Resend Email Service\n');
  console.log(`Sending test email to: ${testEmail}\n`);

  // Check environment variables
  console.log('Checking configuration...');
  console.log(`RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set'}`);
  console.log(`FROM_EMAIL: ${process.env.FROM_EMAIL || '❌ Not set'}\n`);

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_placeholder') {
    console.error('❌ RESEND_API_KEY is not configured properly');
    console.log('\nTo fix this:');
    console.log('1. Sign up at https://resend.com');
    console.log('2. Get your API key from the dashboard');
    console.log('3. Add to .env.local:');
    console.log('   RESEND_API_KEY=re_your_actual_key');
    console.log('   FROM_EMAIL=your-verified-email@yourdomain.com');
    process.exit(1);
  }

  try {
    // Create test order data
    const testOrderData = {
      orderNumber: 'TEST123',
      customerName: 'Test Customer',
      orderDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      items: [
        {
          name: 'Test Product 1',
          quantity: 2,
          price: 29900, // ₹299 in paise
          image: 'https://via.placeholder.com/80',
        },
        {
          name: 'Test Product 2',
          quantity: 1,
          price: 19900, // ₹199 in paise
          image: 'https://via.placeholder.com/80',
        },
      ],
      subtotal: 79700, // ₹797
      shipping: 5000, // ₹50
      discount: 0,
      total: 84700, // ₹847
      shippingAddress: {
        name: 'Test Customer',
        addressLine1: '123 Test Street',
        addressLine2: 'Apartment 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '9876543210',
      },
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(
        'en-IN',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }
      ),
    };

    console.log('Sending test order confirmation email...\n');

    const result = await sendEmail({
      to: testEmail,
      subject: 'Test Order Confirmation - Doon Farm',
      react: OrderConfirmationEmail(testOrderData),
    });

    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('\nCheck your inbox (and spam folder) for the test email.');
      console.log('Subject: Test Order Confirmation - Doon Farm');
    } else {
      console.error('❌ Failed to send email');
      console.error('Error:', result.error);

      if (result.error?.includes('Invalid API key')) {
        console.log('\n💡 Your API key appears to be invalid.');
        console.log('Please check:');
        console.log('1. The API key is correct');
        console.log('2. The API key is active in your Resend dashboard');
      } else if (result.error?.includes('domain')) {
        console.log('\n💡 Domain verification issue.');
        console.log('Please check:');
        console.log('1. Your FROM_EMAIL domain is verified in Resend');
        console.log('2. Or use a Resend-provided email for testing');
      }
    }
  } catch (error) {
    console.error('❌ Error testing email:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
  }
}

testEmail();
