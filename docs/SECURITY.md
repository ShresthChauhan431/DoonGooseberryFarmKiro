# Security Documentation

## API Keys and Secrets Protection

### Environment Variables

All sensitive credentials are stored in environment variables and validated using Zod schemas in `lib/env.ts`.

### Server-Side Only Secrets

The following secrets MUST NEVER be exposed to the client:

1. **RAZORPAY_KEY_SECRET** - Used for payment signature verification
   - Only used in `lib/payment/razorpay.ts` (server-side)
   - Never sent to client
   - Used in Server Actions only

2. **AUTH_SECRET** - Used for session encryption
   - Only used by Better Auth (server-side)
   - Never exposed in API responses

3. **DATABASE_URL** - PostgreSQL connection string
   - Only used by Drizzle ORM (server-side)
   - Never exposed to client

4. **RESEND_API_KEY** - Email service API key
   - Only used in `lib/email/send.ts` (server-side)
   - Never exposed to client

5. **R2_SECRET_ACCESS_KEY** - Cloudflare R2 secret key
   - Only used in `lib/storage/upload.ts` (server-side)
   - Never exposed to client

6. **SENTRY_AUTH_TOKEN** - Sentry authentication token
   - Only used during build process
   - Never exposed to client

### Client-Safe Values

The following values are safe to expose to the client:

1. **RAZORPAY_KEY_ID** - Public Razorpay key
   - Used in payment form on client
   - Retrieved via `getRazorpayKeyId()` function

2. **NEXT_PUBLIC_SENTRY_DSN** - Sentry DSN for client-side error tracking
   - Prefixed with `NEXT_PUBLIC_` to indicate client exposure
   - Safe to expose as it only allows sending errors, not reading them

### Security Checklist

- [ ] All secrets stored in environment variables
- [ ] Environment variables validated with Zod schemas
- [ ] Razorpay secret key never sent to client
- [ ] Database credentials never exposed
- [ ] API keys never logged
- [ ] `.env` files added to `.gitignore`
- [ ] `.env.example` contains no real credentials

### Code Review Guidelines

When reviewing code, ensure:

1. No `process.env` usage in Client Components
2. No secrets in API responses
3. No secrets in console.log statements
4. No secrets in error messages sent to client
5. Server Actions validate all inputs before using secrets

### Example: Correct Secret Usage

```typescript
// ✅ CORRECT - Server Action
'use server';

export async function createPaymentOrder(amount: number) {
  // Secret is only used on server
  const order = await createRazorpayOrder(amount);
  
  // Only return safe data to client
  return {
    orderId: order.id,
    keyId: getRazorpayKeyId(), // Public key only
  };
}
```

```typescript
// ❌ INCORRECT - Exposing secret to client
export async function createPaymentOrder(amount: number) {
  return {
    orderId: order.id,
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET, // NEVER DO THIS!
  };
}
```

## Password Security

### Hashing Configuration

- Algorithm: bcrypt
- Salt rounds: 12
- Automatic salting per password
- Handled by Better Auth automatically

### Password Rules

1. NEVER log passwords (plaintext or hashed)
2. NEVER store plaintext passwords
3. NEVER expose password hashes to client
4. NEVER compare passwords using `===`
5. ALWAYS use Better Auth's built-in password handling

### Password Strength Requirements

Enforced in registration forms:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

See `lib/security/password.ts` for validation utilities.

## Input Validation and Sanitization

### Zod Validation

All user inputs are validated using Zod schemas before processing:

- Product data: `lib/utils/validation.ts`
- Address data: `lib/utils/validation.ts`
- Review data: `lib/utils/validation.ts`
- Cart items: `lib/utils/validation.ts`

### SQL Injection Prevention

- Using Drizzle ORM with parameterized queries
- Never concatenating user input into SQL strings
- All queries use prepared statements

### XSS Prevention

- React automatically escapes output
- User-generated content sanitized before storage
- Content-Security-Policy header configured
- No `dangerouslySetInnerHTML` usage

## CSRF Protection

- Better Auth includes CSRF protection
- All forms use Server Actions (automatic CSRF protection)
- Session cookies have SameSite=Lax

## Session Security

### Cookie Configuration

```typescript
{
  httpOnly: true,      // Prevents JavaScript access
  secure: true,        // HTTPS only in production
  sameSite: 'lax',     // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
}
```

### Session Management

- Sessions stored in database
- Automatic expiration after 7 days
- Session invalidation on logout
- Session validation on every protected route

## Security Headers

Configured in `next.config.ts`:

- **Strict-Transport-Security**: Forces HTTPS for 2 years
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-XSS-Protection**: Enables browser XSS filter
- **Referrer-Policy**: Controls referrer information
- **Content-Security-Policy**: Restricts resource loading
- **Permissions-Policy**: Disables unnecessary browser features

## Rate Limiting

Implemented for authentication endpoints:
- 10 attempts per 10 seconds per IP
- Prevents brute force attacks
- Uses Upstash Rate Limit

## Security Monitoring

### Logging

Security events logged:
- Failed login attempts
- Invalid payment signatures
- Unauthorized access attempts
- Rate limit violations

### Error Handling

- Generic error messages to client
- Detailed errors logged server-side
- No stack traces exposed in production
- Sentry integration for error tracking

## Deployment Security

### Production Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Environment variables configured
- [ ] Security headers active
- [ ] Rate limiting enabled
- [ ] Error monitoring configured
- [ ] Database backups enabled
- [ ] Dependencies updated
- [ ] Security audit completed

### Railway Configuration

1. Enable automatic HTTPS
2. Configure environment variables in dashboard
3. Enable health checks
4. Set up database backups
5. Configure custom domain with SSL

## Incident Response

### If a Secret is Compromised

1. Immediately rotate the compromised secret
2. Update environment variables in production
3. Invalidate all active sessions if AUTH_SECRET compromised
4. Review access logs for suspicious activity
5. Notify affected users if necessary
6. Document the incident

### Reporting Security Issues

Security issues should be reported to: [security@doonfarm.com]

Do not create public GitHub issues for security vulnerabilities.

## Regular Security Tasks

### Weekly
- Review error logs for suspicious patterns
- Check rate limit violations

### Monthly
- Update dependencies (`pnpm update`)
- Review security headers configuration
- Audit user permissions

### Quarterly
- Full security audit
- Penetration testing
- Review and update security policies
- Rotate API keys and secrets

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Better Auth Security](https://www.better-auth.com/docs/security)
- [Razorpay Security](https://razorpay.com/docs/payments/security/)
