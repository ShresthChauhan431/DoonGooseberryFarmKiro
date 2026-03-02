# ⚡ Quick Start - Fix Image Uploads on Vercel

## The Problem
You deployed to Vercel but can't upload images because Vercel's filesystem is read-only.

## The Solution
Use Vercel Blob Storage (takes 2 minutes to set up).

## Steps

### 1️⃣ Enable Blob Storage
1. Open [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database** → **Blob**
5. Name it and click **Create**

### 2️⃣ Redeploy
```bash
git add .
git commit -m "Add Vercel Blob support"
git push
```

Or click **Redeploy** in Vercel Dashboard.

### 3️⃣ Test
1. Login as admin on your deployed site
2. Go to Admin → Settings
3. Upload an image
4. ✅ Done!

## That's It!
The code is already updated. You just need to enable Blob storage in Vercel.

## More Details
- `DEPLOYMENT_INSTRUCTIONS.md` - Full instructions
- `docs/VERCEL_BLOB_SETUP.md` - Complete setup guide
- `docs/VERCEL_DEPLOYMENT_CHECKLIST.md` - Deployment checklist
