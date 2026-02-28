#!/bin/bash

# Image Compression Script for Doon Gooseberry Farm
# This script compresses all images in the public/images directory

set -e

echo "🖼️  Starting image compression..."

# Check if required tools are installed
command -v jpegoptim >/dev/null 2>&1 || {
  echo "❌ jpegoptim is not installed. Install it with:"
  echo "   Mac: brew install jpegoptim"
  echo "   Linux: sudo apt install jpegoptim"
  exit 1
}

command -v pngquant >/dev/null 2>&1 || {
  echo "❌ pngquant is not installed. Install it with:"
  echo "   Mac: brew install pngquant"
  echo "   Linux: sudo apt install pngquant"
  exit 1
}

# Create backup directory
BACKUP_DIR="public/images-backup-$(date +%Y%m%d-%H%M%S)"
echo "📦 Creating backup at $BACKUP_DIR..."
mkdir -p "$BACKUP_DIR"
cp -r public/images/* "$BACKUP_DIR/" 2>/dev/null || true

# Compress JPEG images
echo "🔧 Compressing JPEG images..."
JPEG_COUNT=0
find public/images -type f \( -name "*.jpg" -o -name "*.jpeg" \) | while read file; do
  ORIGINAL_SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
  jpegoptim --max=85 --strip-all "$file" >/dev/null 2>&1
  NEW_SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
  SAVED=$((ORIGINAL_SIZE - NEW_SIZE))
  PERCENT=$((SAVED * 100 / ORIGINAL_SIZE))
  echo "  ✓ $(basename "$file"): Saved ${PERCENT}% ($(numfmt --to=iec $SAVED 2>/dev/null || echo $SAVED bytes))"
  JPEG_COUNT=$((JPEG_COUNT + 1))
done

# Compress PNG images
echo "🔧 Compressing PNG images..."
PNG_COUNT=0
find public/images -type f -name "*.png" | while read file; do
  ORIGINAL_SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
  pngquant --quality=65-80 --force --ext .png "$file" >/dev/null 2>&1 || true
  NEW_SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
  SAVED=$((ORIGINAL_SIZE - NEW_SIZE))
  if [ $SAVED -gt 0 ]; then
    PERCENT=$((SAVED * 100 / ORIGINAL_SIZE))
    echo "  ✓ $(basename "$file"): Saved ${PERCENT}% ($(numfmt --to=iec $SAVED 2>/dev/null || echo $SAVED bytes))"
  fi
  PNG_COUNT=$((PNG_COUNT + 1))
done

echo ""
echo "✅ Image compression complete!"
echo "   Backup saved to: $BACKUP_DIR"
echo ""
echo "To restore from backup:"
echo "   rm -rf public/images"
echo "   cp -r $BACKUP_DIR public/images"
