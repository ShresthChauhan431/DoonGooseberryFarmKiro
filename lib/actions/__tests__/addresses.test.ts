/**
 * Unit tests for Addresses Server Actions
 * Tests createAddress, updateAddress, deleteAddress, and setDefaultAddress
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createAddress, deleteAddress, setDefaultAddress, updateAddress } from '../addresses';

// Mock dependencies
vi.mock('@/lib/auth/config', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';

describe('Addresses Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validAddressData = {
    name: 'John Doe',
    addressLine1: '123 Main Street',
    addressLine2: 'Apartment 4B',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    phone: '9876543210',
  };

  describe('createAddress', () => {
    test('should successfully create address', async () => {
      // Mock authenticated session
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock insert
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as any);

      const result = await createAddress(validAddressData);

      expect(result.success).toBe(true);
      expect(revalidatePath).toHaveBeenCalledWith('/account/addresses');
    });

    test('should fail when user not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await createAddress(validAddressData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unauthorized');
    });

    test('should fail with invalid pincode (not 6 digits)', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      const invalidData = { ...validAddressData, pincode: '12345' };
      const result = await createAddress(invalidData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Pincode must be 6 digits');
    });

    test('should fail with invalid phone (not 10 digits)', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      const invalidData = { ...validAddressData, phone: '987654321' };
      const result = await createAddress(invalidData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Phone must be 10 digits');
    });

    test('should fail with missing required fields', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      const invalidData = { ...validAddressData, name: '' };
      const result = await createAddress(invalidData);

      expect(result.success).toBe(false);
    });

    test('should accept optional addressLine2', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      } as any);

      const dataWithoutLine2 = { ...validAddressData };
      delete (dataWithoutLine2 as any).addressLine2;

      const result = await createAddress(dataWithoutLine2);

      expect(result.success).toBe(true);
    });
  });

  describe('updateAddress', () => {
    test('should successfully update address', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock update
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      const result = await updateAddress('addr-123', validAddressData);

      expect(result.success).toBe(true);
      expect(revalidatePath).toHaveBeenCalledWith('/account/addresses');
    });

    test('should fail when user not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await updateAddress('addr-123', validAddressData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unauthorized');
    });

    test('should fail with invalid data', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      const invalidData = { ...validAddressData, pincode: 'invalid' };
      const result = await updateAddress('addr-123', invalidData);

      expect(result.success).toBe(false);
    });
  });

  describe('deleteAddress', () => {
    test('should successfully delete address', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock delete
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      } as any);

      const result = await deleteAddress('addr-123');

      expect(result.success).toBe(true);
      expect(revalidatePath).toHaveBeenCalledWith('/account/addresses');
    });

    test('should fail when user not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await deleteAddress('addr-123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unauthorized');
    });

    test('should handle database errors gracefully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock database error
      vi.mocked(db.delete).mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await deleteAddress('addr-123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to delete address');
    });
  });

  describe('setDefaultAddress', () => {
    test('should successfully set default address', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock transaction
      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        return callback({
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockResolvedValue(undefined),
          }),
        } as any);
      });

      const result = await setDefaultAddress('addr-123');

      expect(result.success).toBe(true);
      expect(revalidatePath).toHaveBeenCalledWith('/account/addresses');
    });

    test('should fail when user not authenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const result = await setDefaultAddress('addr-123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unauthorized');
    });

    test('should unset all defaults before setting new one', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(undefined),
      });

      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        return callback({
          update: mockUpdate,
        } as any);
      });

      await setDefaultAddress('addr-123');

      // Should be called twice: once to unset all, once to set new default
      expect(mockUpdate).toHaveBeenCalledTimes(2);
    });

    test('should handle transaction errors gracefully', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      } as any);

      // Mock transaction error
      vi.mocked(db.transaction).mockRejectedValue(new Error('Transaction error'));

      const result = await setDefaultAddress('addr-123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to set default address');
    });
  });
});
