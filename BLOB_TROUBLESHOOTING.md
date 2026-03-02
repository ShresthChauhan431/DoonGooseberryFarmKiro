# Vercel Blob Upload Troubleshooting

## Issue: Unable to Upload Images

If you're getting errors when trying to upload images in the admin panel, follow these steps:

### Step 1: Verify Blob Storage is Created

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **doon-gooseberry-farm-kino**
3. Click **Storage** tab
4. You should see: **doon-gooseberry-farm-kino-blob**

If you don't see it, create it:
- Click **Create Database** → **Blob**
- Name it and click **Create**

### Step 2: Verify Environment Variable

1. Go to **Settings** → **Environment Variables**
2. Look for `BLOB_READ_WRITE_TOKEN`
3. It should show: **Added 13m ago** (or similar)
4. Make sure it's enabled for **All Environments**

If it's missing:
- Go back to **Storage** tab
- Click on your Blob store
- The token should be automatically added

### Step 3: Check Error Message

When you try to upload, open browser console (F12) and check for errors:

**If you see:** "Image storage not configured"
- The `BLOB_READ_WRITE_TOKEN` is missing
- Go back to Step 2

**If you see:** "Unauthorized"
- You're not logged in as admin
- Login with admin credentials

**If you see:** "Failed to upload image"
- Check the detailed error in console
- The token might be invalid

### Step 4: Redeploy

After verifying the token exists:

1. Go to **Deployments**
2. Click on the latest deployment
3. Click **...** menu → **Redeploy**
4. Wait for deployment to complete

### Step 5: Test Upload

1. Go to your deployed site
2. Login as admin
3. Navigate to **Admin** → **Settings**
4. Try uploading a small image (< 1MB)
5. Check browser console for any errors

### Common Issues

#### Issue: "BLOB_READ_WRITE_TOKEN is not configured"
**Solution:** The environment variable is missing. Create Blob storage in Vercel dashboard.

#### Issue: Upload button does nothing
**Solution:** Check browser console for JavaScript errors. Make sure you're logged in as admin.

#### Issue: "Failed to upload image" with no details
**Solution:** 
1. Check Vercel function logs: Deployments → Click deployment → View Function Logs
2. Look for upload errors
3. The token might be expired or invalid

#### Issue: Upload works locally but not on Vercel
**Solution:** 
1. Make sure Blob storage is created in Vercel (not just locally)
2. Verify the token is in Vercel environment variables
3. Redeploy after adding the token

### Manual Token Setup (If Auto-Add Failed)

If Vercel didn't automatically add the token:

1. Go to **Storage** → Click your Blob store
2. Look for **Environment Variables** section
3. Copy the `BLOB_READ_WRITE_TOKEN` value
4. Go to **Settings** → **Environment Variables**
5. Click **Add Environment Variable**
6. Name: `BLOB_READ_WRITE_TOKEN`
7. Value: (paste the token)
8. Select: **All Environments**
9. Click **Save**
10. Redeploy

### Still Not Working?

Check the Vercel function logs:
1. Go to **Deployments**
2. Click on your latest deployment
3. Click **View Function Logs**
4. Try uploading an image
5. Look for error messages in the logs

The logs will show the exact error from the server.

### Alternative: Use Image URLs

While troubleshooting, you can use image URLs instead:
1. Upload images to any image hosting service (Imgur, Cloudinary, etc.)
2. Copy the image URL
3. In admin settings, click **Add URL**
4. Paste the image URL
5. Click **Add**

This works immediately without needing Blob storage.
