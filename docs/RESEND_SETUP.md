# Resend Email Service Setup Guide

## Overview

This application uses [Resend](https://resend.com) for sending transactional emails like:
- Order confirmations
- Order shipped notifications
- Order delivered notifications
- Newsletter subscriptions

## Quick Setup

### 1. Sign Up for Resend

1. Go to [https://resend.com](https://resend.com)
2. Click "Sign Up" or "Get Started"
3. Create your account (free tier available)

### 2. Get Your API Key

1. Log in to your Resend dashboard
2. Go to **API Keys** section
3. Click **Create API Key**
4. Give it a name (e.g., "Doon Farm Development")
5. Select permissions (Full Access for development)
6. Click **Create**
7. **Copy the API key** (you won't be able to see it again!)

### 3. Configure Environment Variables

Add to your `.env.local` file:

```env
# Email Service (Resend)
RESEND_API_KEY=re_your_actual_api_key_here
FROM_EMAIL=orders@yourdomain.com
```

**Important**: Replace `re_your_actual_api_key_here` with your actual API key from step 2.

### 4. Domain Verification (For Production)

For development, you can use Resend's test email addresses. For production:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `doonfarm.com`)
4. Add the DNS records shown to your domain provider
5. Wait for verification (usually a few minutes)
6. Once verified, you can send from `orders@yourdomain.com`

## Testing Email Service

### Quick Test

Run the test script with your email:

```bash
tsx scripts/test-email.ts your-email@example.com
```

This will:
- Check if Resend is configured
- Send a test order confirmation email
- Show success or error messages

### Expected Output

**Success**:
```
📧 Testing Resend Email Service

Sending test email to: your-email@example.com

Checking configuration...
RESEND_API_KEY: ✅ Set
FROM_EMAIL: orders@doonfarm.com

Sending test order confirmation email...

✅ Email sent successfully!

Check your inbox (and spam folder) for the test email.
Subject: Test Order Confirmation - Doon Farm
```

**Error - API Key Not Set**:
```
❌ RESEND_API_KEY is not configured properly

To fix this:
1. Sign up at https://resend.com
2. Get your API key from the dashboard
3. Add to .env.local:
   RESEND_API_KEY=re_your_actual_key
   FROM_EMAIL=your-verified-email@yourdomain.com
```

## Development vs Production

### Development

For development, you can:

**Option 1: Use Resend Test Mode**
- Emails sent to any address
- Visible in Resend dashboard
- Not actually delivered to inbox
- Good for testing without spam

**Option 2: Use Your Personal Email**
- Set `FROM_EMAIL=onboarding@resend.dev` (Resend's test domain)
- Send to your personal email
- Actually delivered to inbox
- Good for testing email appearance

```env
# Development - Using Resend test domain
RESEND_API_KEY=re_your_api_key
FROM_EMAIL=onboarding@resend.dev
```

### Production

For production:

1. **Verify your domain** (see step 4 above)
2. **Use your domain email**:
   ```env
   FROM_EMAIL=orders@yourdomain.com
   ```
3. **Monitor email delivery** in Resend dashboard

## Email Templates

The application includes these email templates:

### 1. Order Confirmation
**File**: `lib/email/templates/order-confirmation.tsx`
**Sent**: When order is created
**Includes**:
- Order number
- Order items with images
- Pricing breakdown
- Shipping address
- Estimated delivery date

### 2. Order Shipped
**File**: `lib/email/templates/order-shipped.tsx`
**Sent**: When order status changes to SHIPPED
**Includes**:
- Order number
- Estimated delivery date
- Shipping address

### 3. Order Delivered
**File**: `lib/email/templates/order-delivered.tsx`
**Sent**: When order status changes to DELIVERED
**Includes**:
- Order number
- Delivery confirmation
- Thank you message

## Troubleshooting

### Issue: "Invalid API key"

**Solution**:
1. Check your API key is correct
2. Ensure no extra spaces in `.env.local`
3. Restart your dev server after changing env vars
4. Verify API key is active in Resend dashboard

### Issue: "Domain not verified"

**Solution**:
1. Use `onboarding@resend.dev` for testing
2. Or verify your domain in Resend dashboard
3. Check DNS records are correctly added

### Issue: Emails not arriving

**Check**:
1. Spam/junk folder
2. Resend dashboard for delivery status
3. Email address is correct
4. Domain is verified (for production)

### Issue: "Rate limit exceeded"

**Solution**:
- Free tier has limits (100 emails/day)
- Upgrade plan if needed
- Check for email loops in code

## Monitoring Emails

### Resend Dashboard

1. Go to [https://resend.com/emails](https://resend.com/emails)
2. View all sent emails
3. Check delivery status
4. View email content
5. See error messages

### Application Logs

Check your server logs for:
```
Email sent successfully: { id: '...' }
```

Or errors:
```
Error sending email: { message: '...' }
```

## Best Practices

### 1. Environment Variables

- Never commit API keys to git
- Use different keys for dev/staging/production
- Rotate keys periodically

### 2. Error Handling

The `sendEmail` function handles errors gracefully:
```typescript
const result = await sendEmail({...});
if (!result.success) {
  console.error('Email failed:', result.error);
  // Continue with order creation anyway
}
```

### 3. Async Sending

Emails are sent asynchronously to not block order creation:
```typescript
// Order created first
const order = await createOrder(...);

// Email sent in background
sendEmail(...).catch(error => {
  console.error('Email failed:', error);
});
```

### 4. Testing

- Test emails before going live
- Check spam folder
- Test on multiple email providers (Gmail, Outlook, etc.)
- Verify mobile rendering

## Free Tier Limits

Resend free tier includes:
- 100 emails per day
- 1 domain
- 1 API key
- Email logs for 30 days

For production, consider upgrading based on your needs.

## Support

- **Resend Docs**: https://resend.com/docs
- **Resend Support**: support@resend.com
- **Status Page**: https://status.resend.com

## Quick Commands

```bash
# Test email service
tsx scripts/test-email.ts your-email@example.com

# Check environment variables
cat .env.local | grep RESEND

# View email templates
ls lib/email/templates/

# Check email sending code
cat lib/email/send.ts
```

## Example: Complete Order Flow

1. **Customer places order**
2. **Order created in database**
3. **Payment verified**
4. **Order confirmation email sent**:
   ```typescript
   await sendEmail({
     to: customer.email,
     subject: `Order Confirmation - Order #${orderNumber}`,
     react: OrderConfirmationEmail({...}),
   });
   ```
5. **Admin updates order to SHIPPED**
6. **Shipping notification email sent**
7. **Admin updates order to DELIVERED**
8. **Delivery confirmation email sent**

## Next Steps

1. ✅ Sign up for Resend
2. ✅ Get API key
3. ✅ Add to `.env.local`
4. ✅ Run test script
5. ✅ Verify email received
6. ✅ Test order flow
7. ✅ Verify domain (for production)
8. ✅ Monitor dashboard

---

**Need Help?** Check the [Resend documentation](https://resend.com/docs) or contact their support team.
