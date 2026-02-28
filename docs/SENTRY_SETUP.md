# Sentry Setup Guide

This guide explains how to set up Sentry for error tracking in production.

## Prerequisites

1. Create a Sentry account at [sentry.io](https://sentry.io)
2. Create a new project for your Next.js application

## Configuration Steps

### 1. Get Your Sentry DSN

1. Go to your Sentry project settings
2. Navigate to "Client Keys (DSN)"
3. Copy the DSN URL

### 2. Set Environment Variables

Add the following variables to your `.env` file (or Railway/Vercel environment variables):

```env
# Sentry DSN (both server and client)
SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/123456
NEXT_PUBLIC_SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/123456

# Sentry organization and project (for source map uploads)
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=your-project-slug

# Sentry auth token (for uploading source maps during build)
SENTRY_AUTH_TOKEN=your-auth-token
```

### 3. Create Sentry Auth Token

1. Go to Sentry Settings → Account → API → Auth Tokens
2. Create a new token with the following scopes:
   - `project:read`
   - `project:releases`
   - `org:read`
3. Copy the token and add it to your environment variables

### 4. Test Sentry Integration

To test that Sentry is working:

1. Set `NODE_ENV=production` temporarily
2. Trigger an error in your application
3. Check your Sentry dashboard for the error

## Features

### Automatic Error Tracking

Sentry automatically captures:
- Unhandled exceptions
- Unhandled promise rejections
- Console errors
- Network errors

### Manual Error Tracking

Use the Sentry utility functions in your code:

```typescript
import { captureException, captureMessage } from '@/lib/utils/sentry';

try {
  // Your code
} catch (error) {
  captureException(error, { context: 'additional info' });
}

// Log a message
captureMessage('Something important happened', 'info');
```

### Sensitive Data Filtering

The Sentry configuration automatically filters:
- Cookies
- Authorization headers
- Email addresses
- IP addresses
- Passwords and tokens
- Credit card information

### Performance Monitoring

Sentry tracks:
- Page load times
- API response times
- Database query performance
- Custom transactions

## Production Deployment

### Railway

1. Add all Sentry environment variables to Railway dashboard
2. Deploy your application
3. Sentry will automatically start tracking errors

### Vercel

1. Add all Sentry environment variables to Vercel project settings
2. Deploy your application
3. Sentry will automatically start tracking errors

## Monitoring

### Dashboard

Access your Sentry dashboard to:
- View error reports
- Track error trends
- Set up alerts
- Monitor performance

### Alerts

Configure alerts in Sentry to:
- Get notified of new errors
- Track error frequency
- Monitor performance degradation

## Best Practices

1. **Don't log sensitive data**: The configuration filters common sensitive data, but always review what you're logging
2. **Set appropriate sample rates**: Adjust `tracesSampleRate` based on your traffic
3. **Use breadcrumbs**: Add breadcrumbs for better debugging context
4. **Set user context**: Use `setUser()` to track which users experience errors
5. **Monitor regularly**: Check your Sentry dashboard regularly for issues

## Troubleshooting

### Errors not appearing in Sentry

1. Check that `NODE_ENV=production`
2. Verify your DSN is correct
3. Check that the error isn't being caught and swallowed
4. Verify network connectivity to Sentry

### Source maps not uploading

1. Check that `SENTRY_AUTH_TOKEN` is set
2. Verify `SENTRY_ORG` and `SENTRY_PROJECT` are correct
3. Check build logs for upload errors

### Too many events

1. Adjust `tracesSampleRate` to a lower value
2. Add more errors to `ignoreErrors` list
3. Set up rate limiting in Sentry dashboard

## Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Error Tracking](https://docs.sentry.io/product/issues/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
