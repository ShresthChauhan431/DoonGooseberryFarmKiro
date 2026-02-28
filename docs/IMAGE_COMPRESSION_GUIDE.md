# Image Compression Guide

This guide explains how to optimize and compress images for the Doon Gooseberry Farm e-commerce platform.

## Automatic Compression

Next.js automatically compresses images served through the `next/image` component:

- **WebP/AVIF conversion**: Automatically converts images to modern formats
- **Responsive sizing**: Generates multiple sizes based on device
- **Quality optimization**: Default quality is 75 (configurable)
- **Lazy loading**: Images below the fold are lazy loaded

## Configuration

Image compression is configured in `next.config.ts`:

```typescript
images: {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  // Optional: Adjust quality (default: 75)
  // quality: 80,
}
```

## Pre-Upload Compression

Before uploading images to the platform, compress them using these tools:

### Online Tools

1. **TinyPNG** (https://tinypng.com/)
   - Best for: PNG and JPEG
   - Compression: Lossy, high quality
   - Batch: Up to 20 images

2. **Squoosh** (https://squoosh.app/)
   - Best for: All formats
   - Compression: Customizable
   - Features: Side-by-side comparison

3. **ImageOptim Online** (https://imageoptim.com/online)
   - Best for: Batch processing
   - Compression: Lossless and lossy
   - Features: Removes metadata

### Desktop Tools

1. **ImageOptim** (Mac)
   ```bash
   brew install imageoptim
   ```

2. **FileOptimizer** (Windows)
   - Download from: https://sourceforge.net/projects/nikkhokkho/

3. **GIMP** (Cross-platform)
   - Export with quality: 85-90%
   - Enable progressive JPEG

### Command Line Tools

1. **ImageMagick**
   ```bash
   # Install
   brew install imagemagick  # Mac
   sudo apt install imagemagick  # Linux

   # Compress JPEG
   convert input.jpg -quality 85 -strip output.jpg

   # Compress PNG
   convert input.png -strip -quality 85 output.png

   # Resize and compress
   convert input.jpg -resize 1200x1200 -quality 85 output.jpg
   ```

2. **pngquant** (PNG compression)
   ```bash
   # Install
   brew install pngquant  # Mac
   sudo apt install pngquant  # Linux

   # Compress
   pngquant --quality=65-80 input.png --output output.png
   ```

3. **jpegoptim** (JPEG compression)
   ```bash
   # Install
   brew install jpegoptim  # Mac
   sudo apt install jpegoptim  # Linux

   # Compress
   jpegoptim --max=85 --strip-all input.jpg
   ```

## Automated Compression Script

Create a script to compress all images in a directory:

```bash
#!/bin/bash
# compress-images.sh

# Compress all JPEGs
find public/images -name "*.jpg" -o -name "*.jpeg" | while read file; do
  jpegoptim --max=85 --strip-all "$file"
done

# Compress all PNGs
find public/images -name "*.png" | while read file; do
  pngquant --quality=65-80 --force --ext .png "$file"
done

echo "Image compression complete!"
```

Make it executable:
```bash
chmod +x compress-images.sh
./compress-images.sh
```

## Compression Guidelines by Image Type

### Product Images
- **Format**: JPEG
- **Size**: 1200x1200px
- **Quality**: 85%
- **File size target**: < 200KB

### Hero/Banner Images
- **Format**: JPEG
- **Size**: 1920x1080px
- **Quality**: 85%
- **File size target**: < 300KB

### Blog Featured Images
- **Format**: JPEG
- **Size**: 1200x630px
- **Quality**: 85%
- **File size target**: < 150KB

### Category Images
- **Format**: JPEG or PNG
- **Size**: 800x800px
- **Quality**: 85%
- **File size target**: < 100KB

### Thumbnails
- **Format**: JPEG
- **Size**: 400x400px
- **Quality**: 80%
- **File size target**: < 50KB

## Quality vs File Size

| Quality | Use Case | File Size | Visual Quality |
|---------|----------|-----------|----------------|
| 60-70% | Thumbnails | Smallest | Acceptable |
| 75-85% | Product images | Medium | Good |
| 85-95% | Hero images | Larger | Excellent |
| 100% | Never use | Largest | Unnecessary |

## Bulk Compression Workflow

### For New Product Images

1. **Resize** to 1200x1200px
2. **Compress** to 85% quality
3. **Strip metadata** (EXIF data)
4. **Verify** file size < 200KB
5. **Upload** to platform

### For Existing Images

1. **Audit** current images
   ```bash
   find public/images -type f -size +500k
   ```

2. **Backup** originals
   ```bash
   cp -r public/images public/images-backup
   ```

3. **Compress** using script above

4. **Test** image quality

5. **Deploy** if satisfied

## Performance Monitoring

### Check Image Performance

1. **Lighthouse** (Chrome DevTools)
   - Run audit on product pages
   - Check "Properly size images" metric
   - Target: All images optimized

2. **WebPageTest** (https://webpagetest.org)
   - Test image load times
   - Check compression effectiveness
   - Target: < 2s for all images

3. **Next.js Image Trace**
   ```bash
   NEXT_PUBLIC_ANALYZE=true pnpm build
   ```

## Troubleshooting

### Images look blurry
- Increase quality setting in compression
- Ensure source image is high resolution
- Check if image is being upscaled

### File sizes too large
- Reduce quality to 75-80%
- Resize to appropriate dimensions
- Use JPEG instead of PNG for photos

### Compression artifacts visible
- Increase quality to 85-90%
- Use lossless compression for graphics
- Consider PNG for images with text

## Best Practices

1. **Always compress before upload**
   - Never upload uncompressed images
   - Use automated tools when possible

2. **Use appropriate formats**
   - JPEG for photos
   - PNG for graphics with transparency
   - SVG for logos and icons

3. **Optimize for mobile**
   - Test on mobile devices
   - Ensure images load quickly on 3G

4. **Monitor performance**
   - Regular Lighthouse audits
   - Track Core Web Vitals
   - Set up performance budgets

5. **Maintain quality**
   - Don't over-compress
   - Keep originals as backup
   - Test on different screens

## Automation with CI/CD

Add image compression to your deployment pipeline:

```yaml
# .github/workflows/optimize-images.yml
name: Optimize Images

on:
  push:
    paths:
      - 'public/images/**'

jobs:
  optimize:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Compress Images
        uses: calibreapp/image-actions@main
        with:
          githubToken: ${{ secrets.GITHUB_TOKEN }}
          jpegQuality: 85
          pngQuality: 85
```

## Resources

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)
- [ImageOptim](https://imageoptim.com/)
- [Squoosh](https://squoosh.app/)
- [TinyPNG](https://tinypng.com/)
