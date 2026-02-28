import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Only enable Sentry in production
  enabled: process.env.NODE_ENV === 'production',

  // Filter out sensitive data
  beforeSend(event, hint) {
    // Don't send events if no DSN is configured
    if (!process.env.SENTRY_DSN) {
      return null;
    }

    // Filter out sensitive data from request
    if (event.request) {
      // Remove cookies
      delete event.request.cookies;

      // Remove sensitive headers
      if (event.request.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }

      // Remove sensitive query parameters
      if (event.request.query_string) {
        const sensitiveParams = ['token', 'password', 'secret', 'api_key'];

        if (typeof event.request.query_string === 'string') {
          let queryString = event.request.query_string;
          for (const param of sensitiveParams) {
            queryString = queryString.replace(
              new RegExp(`${param}=[^&]*`, 'gi'),
              `${param}=[FILTERED]`
            );
          }
          event.request.query_string = queryString;
        } else if (Array.isArray(event.request.query_string)) {
          // Handle [string, string][] format
          for (let i = 0; i < event.request.query_string.length; i++) {
            const [key, value] = event.request.query_string[i];
            if (typeof key === 'string' && sensitiveParams.includes(key.toLowerCase())) {
              event.request.query_string[i] = [key, '[FILTERED]'];
            }
          }
        }
      }
    }

    // Filter out sensitive data from user
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }

    // Filter out sensitive data from extra context
    if (event.extra) {
      const sensitiveKeys = ['password', 'token', 'secret', 'api_key', 'credit_card'];

      for (const key of sensitiveKeys) {
        if (event.extra[key]) {
          event.extra[key] = '[FILTERED]';
        }
      }
    }

    return event;
  },

  // Ignore certain errors
  ignoreErrors: [
    // Database connection errors (handled separately)
    'ECONNREFUSED',
    'ETIMEDOUT',
    // Abort errors
    'AbortError',
  ],
});
