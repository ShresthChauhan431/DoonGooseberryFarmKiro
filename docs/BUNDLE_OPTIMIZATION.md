# Bundle Optimization Guide

This document outlines the bundle optimization strategies implemented in the Doon Gooseberry Farm e-commerce platform.

## Implemented Optimizations

### 1. Next.js Configuration

The `next.config.ts` file includes:

- **Package Import Optimization**: Optimizes imports from `lucide-react` and `@radix-ui/react-icons` to reduce bundle size
- **Console Removal**: Removes console statements in production builds
- **Image Optimization**: Configured for WebP and AVIF formats with proper device sizes

### 2. Code Splitting

Next.js automatically splits code by route. Additional optimizations:

- **Dynamic Imports**: Heavy third-party libraries (like Razorpay SDK) are loaded dynamically
- **Route-based Chunks**: Each page is automatically split into separate chunks
- **Shared Chunks**: Common dependencies are extracted into shared chunks

### 3. Image Optimization

- All images use `next/image` component
- WebP and AVIF formats for modern browsers
- Responsive image sizes based on device
- Lazy loading for below-the-fold images
- Priority loading for above-the-fold images

### 4. CSS Optimization

- Tailwind CSS with JIT (Just-In-Time) compilation
- Unused CSS is automatically purged in production
- Critical CSS is inlined

### 5. JavaScript Optimization

- Tree shaking removes unused code
- Minification in production builds
- Compression (gzip/brotli) enabled by default on Vercel/Railway

## Best Practices for Developers

### When to Use Dynamic Imports

Use dynamic imports for:

1. **Heavy Third-Party Libraries**: Libraries that are only needed on specific pages
   ```typescript
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <Skeleton />,
   });
   ```

2. **Conditional Features**: Features that are only used in certain conditions
   ```typescript
   if (isAdmin) {
     const AdminPanel = (await import('./AdminPanel')).default;
   }
   ```

3. **Below-the-Fold Components**: Components that aren't immediately visible
   ```typescript
   const Footer = dynamic(() => import('./Footer'), {
     ssr: false,
   });
   ```

### Package Import Optimization

When importing from large libraries, use specific imports:

```typescript
// ❌ Bad - imports entire library
import * as Icons from 'lucide-react';

// ✅ Good - imports only what's needed
import { ShoppingCart, User } from 'lucide-react';
```

### Image Optimization

Always use `next/image` with proper configuration:

```typescript
<Image
  src="/product.jpg"
  alt="Product name"
  width={500}
  height={500}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={isAboveFold}
/>
```

## Monitoring Bundle Size

### Analyze Bundle

Run the bundle analyzer:

```bash
pnpm build
```

Check the `.next/analyze` folder for detailed bundle analysis.

### Key Metrics to Monitor

1. **First Load JS**: Should be < 200KB for optimal performance
2. **Route Chunks**: Individual route chunks should be < 100KB
3. **Shared Chunks**: Common dependencies should be efficiently shared

## Performance Targets

- **Lighthouse Performance Score**: ≥ 90
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1

## Future Optimizations

1. **Implement Bundle Analyzer**: Add `@next/bundle-analyzer` for detailed analysis
2. **Lazy Load Reviews**: Load review components only when scrolled into view
3. **Optimize Fonts**: Use `next/font` for automatic font optimization
4. **Service Worker**: Implement service worker for offline support and caching
