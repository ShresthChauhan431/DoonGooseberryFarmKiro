/**
 * Unit tests for Newsletter Server Actions
 * Tests subscribeNewsletter
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { subscribeNewsletter } from '../newsletter';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

import { db } from '@/lib/db';

describe('Newsletter Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('subscribeNewsletter', () => {
    test('should successfully subscribe new email', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');

      // Mock email check - email doesn't exist
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      // Mock insert
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as any);

      const result = await subscribeNewsletter(formData);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Thank you for subscribing');
    });

    test('should fail when email already subscribed', async () => {
      const formData = new FormData();
      formData.append('email', 'existing@example.com');

      // Mock email check - email exists
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'sub-123', email: 'existing@example.com' }]),
      } as any);

      const result = await subscribeNewsletter(formData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('already subscribed');
    });

    test('should fail with invalid email format', async () => {
      const formData = new FormData();
      formData.append('email', 'invalid-email');

      const result = await subscribeNewsletter(formData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('valid email');
    });

    test('should fail with empty email', async () => {
      const formData = new FormData();
      formData.append('email', '');

      const result = await subscribeNewsletter(formData);

      expect(result.success).toBe(false);
    });

    test('should handle database errors gracefully', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');

      // Mock database error
      vi.mocked(db.select).mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await subscribeNewsletter(formData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('error occurred');
    });

    test('should accept valid email formats', async () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example-domain.com',
      ];

      for (const email of validEmails) {
        const formData = new FormData();
        formData.append('email', email);

        vi.mocked(db.select).mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([]),
        } as any);

        vi.mocked(db.insert).mockReturnValue({
          values: vi.fn().mockResolvedValue(undefined),
        } as any);

        const result = await subscribeNewsletter(formData);
        expect(result.success).toBe(true);
      }
    });

    test('should reject invalid email formats', async () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
      ];

      for (const email of invalidEmails) {
        const formData = new FormData();
        formData.append('email', email);

        const result = await subscribeNewsletter(formData);
        expect(result.success).toBe(false);
      }
    });
  });
});
