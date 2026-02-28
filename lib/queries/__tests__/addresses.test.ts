import { beforeEach, describe, expect, test, vi } from 'vitest';
import { db } from '@/lib/db';
import { getDefaultAddress, getUserAddresses } from '../addresses';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}));

describe('Address Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserAddresses', () => {
    test('returns all addresses for a user ordered by default status', async () => {
      const mockAddresses = [
        {
          id: 'addr-1',
          userId: 'user-123',
          name: 'John Doe',
          addressLine1: '123 Main St',
          addressLine2: 'Apt 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210',
          isDefault: true,
        },
        {
          id: 'addr-2',
          userId: 'user-123',
          name: 'John Doe',
          addressLine1: '456 Work Ave',
          addressLine2: null,
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400002',
          phone: '9876543211',
          isDefault: false,
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockAddresses),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getUserAddresses('user-123');

      expect(result).toHaveLength(2);
      expect(result[0].isDefault).toBe(true);
      expect(result[0].addressLine1).toBe('123 Main St');
      expect(result[1].isDefault).toBe(false);
      expect(result[1].addressLine1).toBe('456 Work Ave');
    });

    test('returns empty array when user has no addresses', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getUserAddresses('user-no-addresses');

      expect(result).toEqual([]);
    });

    test('handles addresses without addressLine2', async () => {
      const mockAddresses = [
        {
          id: 'addr-1',
          userId: 'user-123',
          name: 'Jane Smith',
          addressLine1: '789 Simple St',
          addressLine2: null,
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          phone: '9876543212',
          isDefault: true,
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockAddresses),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getUserAddresses('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].addressLine2).toBeNull();
    });

    test('includes all required address fields', async () => {
      const mockAddresses = [
        {
          id: 'addr-1',
          userId: 'user-123',
          name: 'Test User',
          addressLine1: '123 Test St',
          addressLine2: 'Floor 2',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          phone: '9876543213',
          isDefault: false,
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockAddresses),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getUserAddresses('user-123');

      expect(result).toHaveLength(1);
      const address = result[0];

      // Verify all required fields
      expect(address.id).toBe('addr-1');
      expect(address.userId).toBe('user-123');
      expect(address.name).toBe('Test User');
      expect(address.addressLine1).toBe('123 Test St');
      expect(address.addressLine2).toBe('Floor 2');
      expect(address.city).toBe('Bangalore');
      expect(address.state).toBe('Karnataka');
      expect(address.pincode).toBe('560001');
      expect(address.phone).toBe('9876543213');
      expect(address.isDefault).toBe(false);
    });

    test('returns multiple addresses in correct order', async () => {
      const mockAddresses = [
        {
          id: 'addr-1',
          userId: 'user-123',
          name: 'User',
          addressLine1: 'Default Address',
          addressLine2: null,
          city: 'City1',
          state: 'State1',
          pincode: '111111',
          phone: '1111111111',
          isDefault: true,
        },
        {
          id: 'addr-2',
          userId: 'user-123',
          name: 'User',
          addressLine1: 'Address 2',
          addressLine2: null,
          city: 'City2',
          state: 'State2',
          pincode: '222222',
          phone: '2222222222',
          isDefault: false,
        },
        {
          id: 'addr-3',
          userId: 'user-123',
          name: 'User',
          addressLine1: 'Address 3',
          addressLine2: null,
          city: 'City3',
          state: 'State3',
          pincode: '333333',
          phone: '3333333333',
          isDefault: false,
        },
      ];

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockAddresses),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getUserAddresses('user-123');

      expect(result).toHaveLength(3);
      // Default address should be first
      expect(result[0].isDefault).toBe(true);
    });
  });

  describe('getDefaultAddress', () => {
    test('returns default address when it exists', async () => {
      const mockAddress = {
        id: 'addr-default',
        userId: 'user-123',
        name: 'John Doe',
        addressLine1: '123 Main St',
        addressLine2: 'Apt 4B',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '9876543210',
        isDefault: true,
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockAddress]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getDefaultAddress('user-123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('addr-default');
      expect(result?.isDefault).toBe(true);
    });

    test('returns null when no default address exists', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getDefaultAddress('user-no-default');

      expect(result).toBeNull();
    });

    test('returns null when user has no addresses', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getDefaultAddress('user-no-addresses');

      expect(result).toBeNull();
    });

    test('returns only one address even if multiple defaults exist', async () => {
      // This shouldn't happen in practice, but test the query behavior
      const mockAddress = {
        id: 'addr-1',
        userId: 'user-123',
        name: 'John Doe',
        addressLine1: '123 Main St',
        addressLine2: null,
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '9876543210',
        isDefault: true,
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockAddress]), // limit(1) ensures only one
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getDefaultAddress('user-123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('addr-1');
    });

    test('includes all address fields in default address', async () => {
      const mockAddress = {
        id: 'addr-1',
        userId: 'user-123',
        name: 'Test User',
        addressLine1: '123 Test St',
        addressLine2: 'Suite 100',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        phone: '9876543214',
        isDefault: true,
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockAddress]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      const result = await getDefaultAddress('user-123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('addr-1');
      expect(result?.userId).toBe('user-123');
      expect(result?.name).toBe('Test User');
      expect(result?.addressLine1).toBe('123 Test St');
      expect(result?.addressLine2).toBe('Suite 100');
      expect(result?.city).toBe('Chennai');
      expect(result?.state).toBe('Tamil Nadu');
      expect(result?.pincode).toBe('600001');
      expect(result?.phone).toBe('9876543214');
      expect(result?.isDefault).toBe(true);
    });
  });
});
