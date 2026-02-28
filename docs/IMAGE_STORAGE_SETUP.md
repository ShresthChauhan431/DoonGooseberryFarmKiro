# Image Storage Setup Guide

This guide explains how to set up image storage for the Doon Gooseberry Farm e-commerce platform using either Vercel Blob or Cloudflare R2.

## Option 1: Vercel Blob (Recommended for Vercel deployments)

### 1. Install Vercel Blob Package

```bash
pnpm add @vercel/blob
```

### 2. Get Blob Storage Token

1. Go to your Vercel project dashboard
2. Navigate to Storage → Blob
3. Create a new Blob store
4. Copy the `BLOB_READ_WRITE_TOKEN`

### 3. Add Environment Variable

Add to your `.env.local`:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
```

### 4. Update Upload API Route

Replace the placeholder code in `app/api/upload/route.ts`:

```typescript
import { put, del } from '@vercel/blob';

// In POST handler:
const blob = await put(file.name, file, {
  access: 'public',
  token: process.env.BLOB_READ_WRITE_TOKEN,
});

return NextResponse.json({ 
  url: blob.url,
  message: 'Image uploaded successfully' 
});

// In DELETE handler:
await del(url, {
  token: process.env.BLOB_READ_WRITE_TOKEN,
});
```

### 5. Update next.config.ts

Uncomment the Vercel Blob remote pattern:

```typescript
{
  protocol: 'https',
  hostname: '*.public.blob.vercel-storage.com',
},
```

## Option 2: Cloudflare R2

### 1. Install AWS SDK

```bash
pnpm add @aws-sdk/client-s3
```

### 2. Create R2 Bucket

1. Go to Cloudflare Dashboard → R2
2. Create a new bucket (e.g., `doon-farm-images`)
3. Create API tokens with read/write permissions
4. Note your Account ID

### 3. Add Environment Variables

Add to your `.env.local`:

```env
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=doon-farm-images
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

### 4. Update Upload API Route

Replace the placeholder code in `app/api/upload/route.ts`:

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// In POST handler:
const buffer = await file.arrayBuffer();
const fileName = `${Date.now()}-${file.name}`;

await s3.send(new PutObjectCommand({
  Bucket: process.env.R2_BUCKET_NAME,
  Key: fileName,
  Body: Buffer.from(buffer),
  ContentType: file.type,
}));

const url = `${process.env.R2_PUBLIC_URL}/${fileName}`;

return NextResponse.json({ 
  url,
  message: 'Image uploaded successfully' 
});

// In DELETE handler:
const fileName = url.split('/').pop();
await s3.send(new DeleteObjectCommand({
  Bucket: process.env.R2_BUCKET_NAME,
  Key: fileName,
}));
```

### 5. Configure R2 Public Access

1. Go to your R2 bucket settings
2. Enable public access
3. Set up a custom domain or use the R2.dev subdomain

### 6. Update next.config.ts

Uncomment the Cloudflare R2 remote pattern and update with your domain:

```typescript
{
  protocol: 'https',
  hostname: 'pub-xxxxx.r2.dev', // Replace with your R2 domain
},
```

## Image Optimization Best Practices

### Compression

Before uploading, compress images using tools like:
- [TinyPNG](https://tinypng.com/)
- [Squoosh](https://squoosh.app/)
- ImageOptim (Mac)

### Recommended Sizes

- **Product Images**: 1200x1200px (square)
- **Hero Images**: 1920x1080px (16:9)
- **Blog Images**: 1200x630px (Open Graph)
- **Category Images**: 800x800px

### File Formats

- Use JPEG for photos
- Use PNG for graphics with transparency
- Next.js will automatically convert to WebP/AVIF

### CDN Configuration

Both Vercel Blob and Cloudflare R2 automatically serve images through a CDN for optimal performance.

## Testing

After setup, test the upload functionality:

1. Go to `/admin/products/new`
2. Click "Upload" button
3. Select an image file
4. Verify the image appears in the preview
5. Create the product and verify the image displays correctly

## Troubleshooting

### Upload fails with 401 error
- Check that your API tokens are correct
- Verify environment variables are set

### Images don't display
- Check that the domain is added to `next.config.ts` remote patterns
- Verify the bucket/blob store has public access enabled

### Upload is slow
- Compress images before uploading
- Check your internet connection
- Consider implementing client-side compression

## Security Considerations

- Never commit API tokens to version control
- Use environment variables for all credentials
- Implement file size limits (currently 5MB)
- Validate file types on the server
- Consider implementing virus scanning for production
