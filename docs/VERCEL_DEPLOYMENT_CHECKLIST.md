# Vercel Deployment Checklist

Quick checklist for deploying your e-commerce site to Vercel.

## ✅ Pre-Deployment

- [ ] Database setup (Neon PostgreSQL)
- [ ] All environment variables ready
- [ ] Code pushed to Git repository

## 🔧 Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

### Required
```
DATABASE_URL=postgresql://...
AUTH_SECRET=your-secret-key-min-32-characters
AUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_AUTH_URL=https://your-domain.vercel.app
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret
RESEND_API_KEY=your-resend-key
FROM_EMAIL=your-email@domain.com
```

### Blob Storage (Auto-configured)
```
BLOB_READ_WRITE_TOKEN=auto-generated-by-vercel
```

### Optional
```
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
SENTRY_DSN=your-sentry-dsn
```

## 📦 Vercel Blob Storage Setup

1. In Vercel Dashboard, go to **Storage** tab
2. Click **Create Database** → **Blob**
3. Name it (e.g., "doon-farm-images")
4. Token is automatically added to environment variables
5. No additional configuration needed!

## 🚀 Deployment Steps

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import your Git repository
   - Select the project

2. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `pnpm run build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

3. **Add Environment Variables**
   - Copy all variables from your `.env.local`
   - Update URLs to use your Vercel domain
   - Add to all environments (Production, Preview, Development)

4. **Enable Blob Storage**
   - Go to Storage tab
   - Create Blob store
   - Verify `BLOB_READ_WRITE_TOKEN` is added

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Test the deployment

## 🧪 Post-Deployment Testing

### 1. Basic Functionality
- [ ] Homepage loads correctly
- [ ] Products display with images
- [ ] User registration works
- [ ] User login works

### 2. Admin Panel
- [ ] Admin login works
- [ ] Can access admin dashboard
- [ ] Settings page loads

### 3. Image Upload (Critical!)
- [ ] Go to Admin → Settings
- [ ] Try uploading a hero image
- [ ] Verify image displays correctly
- [ ] Check that URL contains `vercel-storage.com`

### 4. Cart & Checkout
- [ ] Add items to cart
- [ ] Cart persists across pages
- [ ] Checkout flow works
- [ ] Payment integration works

### 5. Email Service
- [ ] Place a test order
- [ ] Verify order confirmation email arrives
- [ ] Check email formatting

## 🐛 Common Issues

### Build Fails
- Check all environment variables are set
- Verify `NEXT_PUBLIC_AUTH_URL` is set
- Check build logs for specific errors

### Images Not Uploading
- Verify Blob storage is enabled
- Check `BLOB_READ_WRITE_TOKEN` exists
- Test with small image first (< 1MB)

### Database Connection Fails
- Verify `DATABASE_URL` is correct
- Check Neon database is active
- Ensure connection pooling is enabled

### Authentication Not Working
- Update `AUTH_URL` and `NEXT_PUBLIC_AUTH_URL` to production domain
- Verify `AUTH_SECRET` is set (min 32 characters)
- Check Google OAuth redirect URIs if using OAuth

## 📝 Domain Setup

### Custom Domain
1. Go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update environment variables:
   ```
   AUTH_URL=https://yourdomain.com
   NEXT_PUBLIC_AUTH_URL=https://yourdomain.com
   ```
5. Redeploy

### OAuth Redirect URIs
Update in Google Console:
```
https://yourdomain.com/api/auth/callback/google
https://yourdomain.vercel.app/api/auth/callback/google
```

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to:
- **main/master branch** → Production
- **other branches** → Preview deployments

## 📊 Monitoring

- **Analytics**: Vercel Dashboard → Analytics
- **Logs**: Vercel Dashboard → Deployments → View Logs
- **Errors**: Check Sentry if configured

## 🆘 Need Help?

1. Check Vercel deployment logs
2. Review environment variables
3. Test locally first: `pnpm run build && pnpm start`
4. Check [Vercel Documentation](https://vercel.com/docs)
