# Vercel Blob Storage Setup Guide

This guide explains how to set up Vercel Blob Storage for image uploads in your deployed application.

## Why Vercel Blob?

Vercel's serverless environment has a read-only filesystem, so you can't save uploaded files to the local `public/uploads/` directory. Vercel Blob provides a simple, scalable solution for storing files.

## Setup Steps

### 1. Install Vercel Blob Package

```bash
pnpm add @vercel/blob
```

### 2. Enable Blob Storage in Vercel Dashboard

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** tab
3. Click **Create Database** → **Blob**
4. Follow the prompts to create your Blob store
5. Vercel will automatically add `BLOB_READ_WRITE_TOKEN` to your environment variables

### 3. Verify Environment Variable

The `BLOB_READ_WRITE_TOKEN` should be automatically added to your Vercel project. To verify:

1. Go to **Settings** → **Environment Variables**
2. Check that `BLOB_READ_WRITE_TOKEN` exists
3. It should be available for all environments (Production, Preview, Development)

### 4. Local Development

For local development, you can either:

**Option A: Use Vercel Blob locally (Recommended)**
1. Run `vercel env pull .env.local` to sync environment variables
2. This will download the `BLOB_READ_WRITE_TOKEN` to your `.env.local`

**Option B: Use a separate Blob store for development**
1. Create a separate Blob store for development
2. Add the token to your `.env.local` manually

## How It Works

The upload API (`app/api/upload/route.ts`) now uses Vercel Blob:

```typescript
import { put } from '@vercel/blob';

// Upload file
const blob = await put(filename, file, {
  access: 'public',
  addRandomSuffix: false,
});

// Returns: { url: 'https://...blob.vercel-storage.com/...' }
```

## Features

- **Automatic CDN**: All uploaded images are served via Vercel's global CDN
- **No file size limits**: Unlike local storage, Blob can handle large files
- **Automatic cleanup**: Old files can be managed through the Vercel dashboard
- **Secure**: Only authenticated admins can upload files

## Testing

After setup, test the upload functionality:

1. Log in as admin
2. Go to **Admin** → **Settings**
3. Try uploading an image in the Homepage Settings
4. The image should upload and display correctly

## Troubleshooting

### Upload fails with "Unauthorized"
- Check that `BLOB_READ_WRITE_TOKEN` is set in Vercel environment variables
- Redeploy your application after adding the token

### Images not displaying
- Verify the blob URL is correct (should contain `vercel-storage.com`)
- Check browser console for CORS errors
- Ensure images are set to `public` access

### Local development not working
- Run `vercel env pull .env.local` to sync environment variables
- Make sure you're logged in to Vercel CLI: `vercel login`

## Cost

Vercel Blob pricing:
- **Hobby plan**: 1GB storage, 100GB bandwidth/month (free)
- **Pro plan**: 100GB storage, 1TB bandwidth/month
- Additional usage is billed separately

For most small to medium e-commerce sites, the free tier is sufficient.

## Migration from Local Storage

If you have existing images in `public/uploads/`:

1. Images with relative URLs (`/uploads/...`) will continue to work
2. New uploads will use Vercel Blob (full URLs)
3. You can manually migrate old images by re-uploading them through the admin panel
4. Or keep both systems running (old images stay local, new ones use Blob)

## Additional Resources

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Vercel Blob SDK Reference](https://vercel.com/docs/storage/vercel-blob/using-blob-sdk)
