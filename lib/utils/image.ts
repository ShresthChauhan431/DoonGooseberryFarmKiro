/**
 * Generate a shimmer effect as a blur placeholder for images
 * This creates a base64 encoded SVG that shows a loading shimmer
 */
export function getImageShimmer(width: number, height: number): string {
  const shimmer = `
    <svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f6f7f8" offset="0%" />
          <stop stop-color="#edeef1" offset="20%" />
          <stop stop-color="#f6f7f8" offset="40%" />
          <stop stop-color="#f6f7f8" offset="100%" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="#f6f7f8" />
      <rect id="r" width="${width}" height="${height}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${width}" to="${width}" dur="1s" repeatCount="indefinite"  />
    </svg>
  `;

  const toBase64 = (str: string) =>
    typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str);

  return `data:image/svg+xml;base64,${toBase64(shimmer)}`;
}

/**
 * Get blur data URL for product images
 * Uses a shimmer effect for loading state
 */
export function getProductImageBlurDataURL(): string {
  return getImageShimmer(600, 600);
}

/**
 * Get blur data URL for blog images
 * Uses a shimmer effect for loading state
 */
export function getBlogImageBlurDataURL(): string {
  return getImageShimmer(1200, 630);
}
