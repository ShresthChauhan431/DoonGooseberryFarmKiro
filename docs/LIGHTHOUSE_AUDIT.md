# Lighthouse Performance Audit Guide

This document provides instructions for running Lighthouse performance audits on the Doon Gooseberry Farm e-commerce platform.

## Performance Targets

According to Requirement 34, the system must achieve:

- **Performance Score**: ≥ 90
- **First Contentful Paint (FCP)**: < 1.5 seconds
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **Time to Interactive (TTI)**: < 3.5 seconds
- **Cumulative Layout Shift (CLS)**: < 0.1

## Running Lighthouse Audits

### Method 1: Chrome DevTools (Recommended for Development)

1. Open Chrome browser
2. Navigate to the page you want to test
3. Open DevTools (F12 or Cmd+Option+I on Mac)
4. Click on the "Lighthouse" tab
5. Select:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
6. Choose "Desktop" or "Mobile" device
7. Click "Analyze page load"

### Method 2: Lighthouse CLI

Install Lighthouse globally:

```bash
npm install -g lighthouse
```

Run audit on specific pages:

```bash
# Homepage
lighthouse http://localhost:3000 --output html --output-path ./lighthouse-reports/homepage.html --view

# Shop page
lighthouse http://localhost:3000/shop --output html --output-path ./lighthouse-reports/shop.html --view

# Product detail page
lighthouse http://localhost:3000/shop/mango-pickle --output html --output-path ./lighthouse-reports/product.html --view
```

### Method 3: PageSpeed Insights (Production Only)

1. Visit https://pagespeed.web.dev/
2. Enter your production URL
3. Click "Analyze"

## Pages to Test

Test these critical pages:

1. **Homepage** (`/`)
   - Hero section with images
   - Featured products carousel
   - Category grid
   - Newsletter form

2. **Shop Page** (`/shop`)
   - Product grid with images
   - Filter sidebar
   - Search functionality

3. **Product Detail Page** (`/shop/[slug]`)
   - Product gallery
   - Product information
   - Reviews section
   - Related products

4. **Cart Page** (`/cart`)
   - Cart items with images
   - Cart summary

5. **Checkout Page** (`/checkout`) (Requires authentication)
   - Multi-step form
   - Address form
   - Payment integration

## Common Performance Issues and Solutions

### Issue: Large Images

**Solution:**
- Use `next/image` component (already implemented)
- Specify proper `sizes` attribute
- Use WebP/AVIF formats (configured in next.config.ts)
- Compress images before upload

### Issue: Render-Blocking Resources

**Solution:**
- Use `priority` prop for above-the-fold images
- Defer non-critical JavaScript
- Inline critical CSS (handled by Next.js)

### Issue: Unused JavaScript

**Solution:**
- Enable code splitting (already configured)
- Use dynamic imports for heavy components
- Optimize package imports (configured in next.config.ts)

### Issue: Layout Shift (CLS)

**Solution:**
- Always specify width and height for images
- Reserve space for dynamic content
- Use skeleton loaders during loading states

### Issue: Slow Server Response

**Solution:**
- Implement ISR for static pages (configured)
- Use database indexes (implemented)
- Optimize database queries (implemented)
- Enable caching (configured)

## Interpreting Results

### Performance Score Breakdown

- **0-49**: Poor (Red) - Immediate action required
- **50-89**: Needs Improvement (Orange) - Optimization recommended
- **90-100**: Good (Green) - Target achieved

### Key Metrics Explained

1. **First Contentful Paint (FCP)**
   - When the first text or image is painted
   - Target: < 1.5s
   - Affected by: Server response time, render-blocking resources

2. **Largest Contentful Paint (LCP)**
   - When the largest content element is painted
   - Target: < 2.5s
   - Affected by: Image optimization, server response time

3. **Time to Interactive (TTI)**
   - When the page becomes fully interactive
   - Target: < 3.5s
   - Affected by: JavaScript bundle size, main thread work

4. **Cumulative Layout Shift (CLS)**
   - Measures visual stability
   - Target: < 0.1
   - Affected by: Image dimensions, dynamic content

5. **Total Blocking Time (TBT)**
   - Time when main thread is blocked
   - Target: < 300ms
   - Affected by: JavaScript execution time

## Optimization Checklist

Before running audits, ensure:

- ✅ All images use `next/image` component
- ✅ Images have width and height attributes
- ✅ Above-the-fold images use `priority` prop
- ✅ ISR is configured for product pages
- ✅ Dynamic pages use `force-dynamic`
- ✅ Database queries are optimized
- ✅ Bundle optimization is configured
- ✅ Compression is enabled (automatic on Vercel/Railway)

## Continuous Monitoring

### Development

Run Lighthouse audits:
- Before committing major changes
- After adding new features
- When performance issues are reported

### Production

Monitor performance:
- Weekly Lighthouse audits on production
- Set up performance monitoring (e.g., Vercel Analytics)
- Track Core Web Vitals in Google Search Console

## Troubleshooting

### Low Performance Score

1. Check Network tab for large resources
2. Review Coverage tab for unused code
3. Analyze bundle size with `pnpm build`
4. Check database query performance
5. Review server response times

### High CLS Score

1. Add explicit dimensions to all images
2. Reserve space for dynamic content
3. Avoid inserting content above existing content
4. Use CSS transforms instead of layout-triggering properties

### Slow LCP

1. Optimize hero images
2. Reduce server response time
3. Eliminate render-blocking resources
4. Preload critical resources

## Reporting

Document audit results:

```markdown
## Lighthouse Audit Results - [Date]

### Homepage
- Performance: 95
- FCP: 1.2s
- LCP: 2.1s
- TTI: 2.8s
- CLS: 0.05

### Shop Page
- Performance: 92
- FCP: 1.3s
- LCP: 2.3s
- TTI: 3.1s
- CLS: 0.08

### Product Detail
- Performance: 94
- FCP: 1.1s
- LCP: 2.0s
- TTI: 2.9s
- CLS: 0.06

### Issues Found
- None - All targets met

### Recommendations
- Continue monitoring
- Consider implementing service worker for offline support
```

## Resources

- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [PageSpeed Insights](https://pagespeed.web.dev/)
