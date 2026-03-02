# 🚀 Quick Deployment Fix for Image Uploads

## What Changed?

Your app now uses **Vercel Blob Storage** instead of local filesystem for image uploads. This is required because Vercel's serverless environment has a read-only filesystem.

## What You Need to Do

### 1. Enable Blob Storage in Vercel (2 minutes)

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on the **Storage** tab
3. Click **Create Database** → Select **Blob**
4. Give it a name (e.g., "doon-farm-images")
5. Click **Create**

That's it! Vercel automatically adds `BLOB_READ_WRITE_TOKEN` to your environment variables.

### 2. Redeploy Your Application

After enabling Blob storage:

```bash
# Option A: Push a new commit to trigger deployment
git add .
git commit -m "Add Vercel Blob storage support"
git push

# Option B: Redeploy from Vercel Dashboard
# Go to Deployments → Click "..." → Redeploy
```

### 3. Test Image Upload

1. Go to your deployed site
2. Login as admin
3. Navigate to **Admin** → **Settings**
4. Try uploading a hero image
5. It should now work! ✅

## For Local Development

To test uploads locally:

```bash
# Pull environment variables from Vercel
vercel env pull .env.local

# This downloads BLOB_READ_WRITE_TOKEN to your .env.local
```

## What Was Installed

```bash
pnpm add @vercel/blob
```

This package is already installed and committed.

## Files Changed

- `app/api/upload/route.ts` - Now uses Vercel Blob instead of filesystem
- `.env.example` - Updated with Blob token
- `docs/VERCEL_BLOB_SETUP.md` - Detailed setup guide
- `docs/VERCEL_DEPLOYMENT_CHECKLIST.md` - Complete deployment checklist

## Verification

After deployment, uploaded images will have URLs like:
```
https://abc123xyz.blob.vercel-storage.com/image-1234567890.jpg
```

Instead of:
```
/uploads/image-1234567890.jpg
```

## Cost

Vercel Blob is free for:
- 1GB storage
- 100GB bandwidth per month

This is more than enough for most e-commerce sites.

## Need Help?

Check the detailed guides:
- `docs/VERCEL_BLOB_SETUP.md` - Complete Blob setup guide
- `docs/VERCEL_DEPLOYMENT_CHECKLIST.md` - Full deployment checklist
