/**
 * Unit tests for image utility functions
 * Tests shimmer generation and blur data URL functions
 */

import { describe, expect, test } from 'vitest';
import { getBlogImageBlurDataURL, getImageShimmer, getProductImageBlurDataURL } from '../image';

describe('Image Utility Functions', () => {
  describe('getImageShimmer', () => {
    test('should generate base64 encoded SVG shimmer', () => {
      const shimmer = getImageShimmer(600, 400);
      expect(shimmer).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    test('should include correct width and height in SVG', () => {
      const shimmer = getImageShimmer(800, 600);
      const decoded = Buffer.from(
        shimmer.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString();
      expect(decoded).toContain('width="800"');
      expect(decoded).toContain('height="600"');
    });

    test('should generate different shimmers for different dimensions', () => {
      const shimmer1 = getImageShimmer(100, 100);
      const shimmer2 = getImageShimmer(200, 200);
      expect(shimmer1).not.toBe(shimmer2);
    });

    test('should handle small dimensions', () => {
      const shimmer = getImageShimmer(10, 10);
      expect(shimmer).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    test('should handle large dimensions', () => {
      const shimmer = getImageShimmer(2000, 2000);
      expect(shimmer).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    test('should include gradient definition', () => {
      const shimmer = getImageShimmer(600, 400);
      const decoded = Buffer.from(
        shimmer.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString();
      expect(decoded).toContain('linearGradient');
      expect(decoded).toContain('id="g"');
    });

    test('should include animation', () => {
      const shimmer = getImageShimmer(600, 400);
      const decoded = Buffer.from(
        shimmer.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString();
      expect(decoded).toContain('animate');
      expect(decoded).toContain('repeatCount="indefinite"');
    });
  });

  describe('getProductImageBlurDataURL', () => {
    test('should return base64 encoded data URL', () => {
      const blurDataURL = getProductImageBlurDataURL();
      expect(blurDataURL).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    test('should use 600x600 dimensions for product images', () => {
      const blurDataURL = getProductImageBlurDataURL();
      const decoded = Buffer.from(
        blurDataURL.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString();
      expect(decoded).toContain('width="600"');
      expect(decoded).toContain('height="600"');
    });

    test('should return consistent result', () => {
      const blur1 = getProductImageBlurDataURL();
      const blur2 = getProductImageBlurDataURL();
      expect(blur1).toBe(blur2);
    });
  });

  describe('getBlogImageBlurDataURL', () => {
    test('should return base64 encoded data URL', () => {
      const blurDataURL = getBlogImageBlurDataURL();
      expect(blurDataURL).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    test('should use 1200x630 dimensions for blog images', () => {
      const blurDataURL = getBlogImageBlurDataURL();
      const decoded = Buffer.from(
        blurDataURL.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString();
      expect(decoded).toContain('width="1200"');
      expect(decoded).toContain('height="630"');
    });

    test('should return consistent result', () => {
      const blur1 = getBlogImageBlurDataURL();
      const blur2 = getBlogImageBlurDataURL();
      expect(blur1).toBe(blur2);
    });

    test('should be different from product image blur', () => {
      const productBlur = getProductImageBlurDataURL();
      const blogBlur = getBlogImageBlurDataURL();
      expect(productBlur).not.toBe(blogBlur);
    });
  });

  describe('SVG Structure', () => {
    test('should generate valid SVG structure', () => {
      const shimmer = getImageShimmer(600, 400);
      const decoded = Buffer.from(
        shimmer.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString();

      // Check for SVG opening tag
      expect(decoded).toContain('<svg');
      expect(decoded).toContain('xmlns="http://www.w3.org/2000/svg"');

      // Check for defs section
      expect(decoded).toContain('<defs>');
      expect(decoded).toContain('</defs>');

      // Check for rect elements
      expect(decoded).toContain('<rect');

      // Check for animate element
      expect(decoded).toContain('<animate');
    });

    test('should include proper color stops', () => {
      const shimmer = getImageShimmer(600, 400);
      const decoded = Buffer.from(
        shimmer.replace('data:image/svg+xml;base64,', ''),
        'base64'
      ).toString();

      expect(decoded).toContain('stop-color="#f6f7f8"');
      expect(decoded).toContain('stop-color="#edeef1"');
    });
  });
});
