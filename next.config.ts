import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable code splitting and optimization
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Compiler options for optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Security headers
  async headers() {
    // Derive explicit connect-src origins from environment variables so the
    // Content Security Policy names the actual deployment domains rather than
    // relying on the broad *.vercel.app wildcard.
    //
    // Priority:
    //   NEXT_PUBLIC_APP_URL  — the canonical frontend deployment URL
    //   AUTH_URL             — the API / Better Auth server URL
    //   NEXT_PUBLIC_AUTH_URL — client-side alias for AUTH_URL
    //
    // Falls back to the wildcard when no env var is set (local dev /
    // uninitialised deployments) so existing setups keep working unchanged.
    const appOrigin = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/+$/, '');
    const authOrigin = (process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_AUTH_URL ?? '').replace(
      /\/+$/,
      ''
    );

    // Deduplicate and drop empty strings.  In a same-origin deployment both
    // variables point to the same URL, so the Set collapses them to one entry.
    const explicitOrigins = [...new Set([appOrigin, authOrigin].filter(Boolean))];

    // Use the wildcard only as a last resort — it accepts every *.vercel.app
    // domain which is wider than necessary in production.
    const connectSrcVercel =
      explicitOrigins.length > 0 ? explicitOrigins.join(' ') : 'https://*.vercel.app';

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob: https://*.public.blob.vercel-storage.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              // connectSrcVercel is either explicit deployment URLs (preferred)
              // or the *.vercel.app wildcard fallback — see computation above.
              `connect-src 'self' https://api.razorpay.com https://*.sentry.io ${connectSrcVercel} https://*.public.blob.vercel-storage.com`,
              "frame-src 'self' https://api.razorpay.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Image quality (1-100, default: 75)
    // Lower values = smaller file size, lower quality
    // Higher values = larger file size, higher quality
    minimumCacheTTL: 86400, // Cache images for 1 day
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      // Add your Cloudflare R2 domain when configured
      // {
      //   protocol: 'https',
      //   hostname: 'pub-*.r2.dev',
      // },
    ],
  },
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

const sentryOptions = {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: false,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors.
  automaticVercelMonitors: true,
};

// Export the config with Sentry
export default process.env.NODE_ENV === 'production'
  ? withSentryConfig(nextConfig, {
      ...sentryWebpackPluginOptions,
      ...sentryOptions,
    })
  : nextConfig;
