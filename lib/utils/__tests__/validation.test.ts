/**
 * Unit tests for validation schemas
 * Tests all Zod schemas and validation helper functions
 */

import { describe, expect, test } from 'vitest';
import {
  addressSchema,
  cartItemSchema,
  couponSchema,
  formatValidationErrors,
  newsletterSchema,
  orderSchema,
  orderStatusSchema,
  paginationSchema,
  paymentVerificationSchema,
  productSchema,
  profileSchema,
  reviewSchema,
  sanitizeHtml,
  sanitizeString,
  searchQuerySchema,
  validateData,
  validateDataSafe,
} from '../validation';

describe('Sanitization Functions', () => {
  describe('sanitizeString', () => {
    test('should remove angle brackets', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    });

    test('should remove javascript: protocol', () => {
      expect(sanitizeString('javascript:alert("xss")')).toBe('alert("xss")');
    });

    test('should remove event handlers', () => {
      expect(sanitizeString('onclick=alert("xss")')).toBe('alert("xss")');
    });

    test('should trim whitespace', () => {
      expect(sanitizeString('  hello world  ')).toBe('hello world');
    });

    test('should handle normal text', () => {
      expect(sanitizeString('Hello World 123')).toBe('Hello World 123');
    });
  });

  describe('sanitizeHtml', () => {
    test('should remove script tags', () => {
      expect(sanitizeHtml('<p>Hello</p><script>alert("xss")</script>')).toBe('<p>Hello</p>');
    });

    test('should remove event handlers with double quotes', () => {
      expect(sanitizeHtml('<div onclick="alert()">Test</div>')).toBe('<div >Test</div>');
    });

    test('should remove event handlers with single quotes', () => {
      expect(sanitizeHtml("<div onclick='alert()'>Test</div>")).toBe('<div >Test</div>');
    });

    test('should remove javascript: protocol', () => {
      expect(sanitizeHtml('<a href="javascript:alert()">Link</a>')).toBe(
        '<a href="alert()">Link</a>'
      );
    });

    test('should trim whitespace', () => {
      expect(sanitizeHtml('  <p>Hello</p>  ')).toBe('<p>Hello</p>');
    });
  });
});

describe('Product Schema', () => {
  test('should validate valid product data', () => {
    const validProduct = {
      name: 'Mango Pickle',
      slug: 'mango-pickle',
      description: 'Delicious homemade mango pickle with authentic spices',
      price: 29900,
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      stock: 50,
      images: ['https://example.com/image1.jpg'],
      isActive: true,
    };

    const result = productSchema.parse(validProduct);
    expect(result.name).toBe('Mango Pickle');
  });

  test('should reject product with empty name', () => {
    const invalidProduct = {
      name: '',
      slug: 'test',
      description: 'Test description here',
      price: 100,
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      stock: 10,
      images: ['https://example.com/image.jpg'],
    };

    expect(() => productSchema.parse(invalidProduct)).toThrow('Product name is required');
  });

  test('should reject product with invalid slug format', () => {
    const invalidProduct = {
      name: 'Test Product',
      slug: 'Invalid Slug!',
      description: 'Test description here',
      price: 100,
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      stock: 10,
      images: ['https://example.com/image.jpg'],
    };

    expect(() => productSchema.parse(invalidProduct)).toThrow('Slug must be lowercase');
  });

  test('should reject product with short description', () => {
    const invalidProduct = {
      name: 'Test',
      slug: 'test',
      description: 'Short',
      price: 100,
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      stock: 10,
      images: ['https://example.com/image.jpg'],
    };

    expect(() => productSchema.parse(invalidProduct)).toThrow('at least 10 characters');
  });

  test('should reject product with negative price', () => {
    const invalidProduct = {
      name: 'Test',
      slug: 'test',
      description: 'Test description here',
      price: -100,
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      stock: 10,
      images: ['https://example.com/image.jpg'],
    };

    expect(() => productSchema.parse(invalidProduct)).toThrow('Price must be positive');
  });

  test('should reject product with negative stock', () => {
    const invalidProduct = {
      name: 'Test',
      slug: 'test',
      description: 'Test description here',
      price: 100,
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      stock: -5,
      images: ['https://example.com/image.jpg'],
    };

    expect(() => productSchema.parse(invalidProduct)).toThrow('Stock cannot be negative');
  });

  test('should reject product with no images', () => {
    const invalidProduct = {
      name: 'Test',
      slug: 'test',
      description: 'Test description here',
      price: 100,
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      stock: 10,
      images: [],
    };

    expect(() => productSchema.parse(invalidProduct)).toThrow('At least one image is required');
  });

  test('should sanitize product name', () => {
    const product = {
      name: '<script>Test</script>',
      slug: 'test',
      description: 'Test description here',
      price: 100,
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      stock: 10,
      images: ['https://example.com/image.jpg'],
    };

    const result = productSchema.parse(product);
    expect(result.name).not.toContain('<script>');
  });
});

describe('Address Schema', () => {
  test('should validate valid address data', () => {
    const validAddress = {
      name: 'John Doe',
      addressLine1: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '9876543210',
    };

    const result = addressSchema.parse(validAddress);
    expect(result.name).toBe('John Doe');
  });

  test('should reject address with invalid pincode', () => {
    const invalidAddress = {
      name: 'John Doe',
      addressLine1: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '12345', // Only 5 digits
      phone: '9876543210',
    };

    expect(() => addressSchema.parse(invalidAddress)).toThrow('Pincode must be exactly 6 digits');
  });

  test('should reject address with invalid phone', () => {
    const invalidAddress = {
      name: 'John Doe',
      addressLine1: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '987654321', // Only 9 digits
    };

    expect(() => addressSchema.parse(invalidAddress)).toThrow(
      'Phone number must be exactly 10 digits'
    );
  });

  test('should accept optional addressLine2', () => {
    const address = {
      name: 'John Doe',
      addressLine1: '123 Main Street',
      addressLine2: 'Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '9876543210',
    };

    const result = addressSchema.parse(address);
    expect(result.addressLine2).toBe('Apartment 4B');
  });

  test('should default isDefault to false', () => {
    const address = {
      name: 'John Doe',
      addressLine1: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '9876543210',
    };

    const result = addressSchema.parse(address);
    expect(result.isDefault).toBe(false);
  });
});

describe('Review Schema', () => {
  test('should validate valid review data', () => {
    const validReview = {
      rating: 5,
      comment: 'Excellent product! Highly recommended for everyone.',
    };

    const result = reviewSchema.parse(validReview);
    expect(result.rating).toBe(5);
  });

  test('should reject review with rating below 1', () => {
    const invalidReview = {
      rating: 0,
      comment: 'Test comment here',
    };

    expect(() => reviewSchema.parse(invalidReview)).toThrow('Rating must be at least 1');
  });

  test('should reject review with rating above 5', () => {
    const invalidReview = {
      rating: 6,
      comment: 'Test comment here',
    };

    expect(() => reviewSchema.parse(invalidReview)).toThrow('Rating must be at most 5');
  });

  test('should reject review with short comment', () => {
    const invalidReview = {
      rating: 5,
      comment: 'Short',
    };

    expect(() => reviewSchema.parse(invalidReview)).toThrow('at least 10 characters');
  });

  test('should reject review with long comment', () => {
    const invalidReview = {
      rating: 5,
      comment: 'a'.repeat(501),
    };

    expect(() => reviewSchema.parse(invalidReview)).toThrow('less than 500 characters');
  });
});

describe('Cart Item Schema', () => {
  test('should validate valid cart item data', () => {
    const validCartItem = {
      productId: '123e4567-e89b-12d3-a456-426614174000',
      quantity: 5,
    };

    const result = cartItemSchema.parse(validCartItem);
    expect(result.quantity).toBe(5);
  });

  test('should reject cart item with invalid product ID', () => {
    const invalidCartItem = {
      productId: 'not-a-uuid',
      quantity: 1,
    };

    expect(() => cartItemSchema.parse(invalidCartItem)).toThrow('Invalid product ID');
  });

  test('should reject cart item with zero quantity', () => {
    const invalidCartItem = {
      productId: '123e4567-e89b-12d3-a456-426614174000',
      quantity: 0,
    };

    expect(() => cartItemSchema.parse(invalidCartItem)).toThrow('Quantity must be positive');
  });

  test('should reject cart item with negative quantity', () => {
    const invalidCartItem = {
      productId: '123e4567-e89b-12d3-a456-426614174000',
      quantity: -5,
    };

    expect(() => cartItemSchema.parse(invalidCartItem)).toThrow('Quantity must be positive');
  });
});

describe('Coupon Schema', () => {
  test('should validate valid coupon data', () => {
    const validCoupon = {
      code: 'SAVE20',
      discountType: 'PERCENTAGE' as const,
      discountValue: 20,
      maxUses: 100,
      expiresAt: new Date(Date.now() + 86400000), // Tomorrow
    };

    const result = couponSchema.parse(validCoupon);
    expect(result.code).toBe('SAVE20');
  });

  test('should reject coupon with invalid code format', () => {
    const invalidCoupon = {
      code: 'save 20', // Lowercase and space
      discountType: 'PERCENTAGE' as const,
      discountValue: 20,
      maxUses: 100,
      expiresAt: new Date(Date.now() + 86400000),
    };

    expect(() => couponSchema.parse(invalidCoupon)).toThrow('uppercase letters');
  });

  test('should reject coupon with past expiration date', () => {
    const invalidCoupon = {
      code: 'EXPIRED',
      discountType: 'PERCENTAGE' as const,
      discountValue: 20,
      maxUses: 100,
      expiresAt: new Date(Date.now() - 86400000), // Yesterday
    };

    expect(() => couponSchema.parse(invalidCoupon)).toThrow('must be in the future');
  });

  test('should default minOrderValue to 0', () => {
    const coupon = {
      code: 'TEST',
      discountType: 'FLAT' as const,
      discountValue: 1000,
      maxUses: 50,
      expiresAt: new Date(Date.now() + 86400000),
    };

    const result = couponSchema.parse(coupon);
    expect(result.minOrderValue).toBe(0);
  });
});

describe('Profile Schema', () => {
  test('should validate valid profile data', () => {
    const validProfile = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    const result = profileSchema.parse(validProfile);
    expect(result.name).toBe('John Doe');
  });

  test('should convert email to lowercase', () => {
    const profile = {
      name: 'John Doe',
      email: 'JOHN@EXAMPLE.COM',
    };

    const result = profileSchema.parse(profile);
    expect(result.email).toBe('john@example.com');
  });

  test('should reject invalid email', () => {
    const invalidProfile = {
      name: 'John Doe',
      email: 'not-an-email',
    };

    expect(() => profileSchema.parse(invalidProfile)).toThrow('Invalid email');
  });
});

describe('Newsletter Schema', () => {
  test('should validate valid email', () => {
    const validNewsletter = {
      email: 'subscriber@example.com',
    };

    const result = newsletterSchema.parse(validNewsletter);
    expect(result.email).toBe('subscriber@example.com');
  });

  test('should convert email to lowercase', () => {
    const newsletter = {
      email: 'SUBSCRIBER@EXAMPLE.COM',
    };

    const result = newsletterSchema.parse(newsletter);
    expect(result.email).toBe('subscriber@example.com');
  });
});

describe('Search Query Schema', () => {
  test('should validate valid search query', () => {
    const validQuery = {
      q: 'mango pickle',
      sort: 'price-asc' as const,
    };

    const result = searchQuerySchema.parse(validQuery);
    expect(result.q).toBe('mango pickle');
  });

  test('should sanitize search query', () => {
    const query = {
      q: '<script>alert("xss")</script>',
    };

    const result = searchQuerySchema.parse(query);
    expect(result.q).not.toContain('<script>');
  });

  test('should accept optional filters', () => {
    const query = {
      q: 'pickle',
      category: '123e4567-e89b-12d3-a456-426614174000',
      priceMin: 10000,
      priceMax: 50000,
    };

    const result = searchQuerySchema.parse(query);
    expect(result.priceMin).toBe(10000);
    expect(result.priceMax).toBe(50000);
  });
});

describe('Pagination Schema', () => {
  test('should validate valid pagination data', () => {
    const validPagination = {
      page: 2,
      limit: 50,
    };

    const result = paginationSchema.parse(validPagination);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(50);
  });

  test('should default page to 1', () => {
    const pagination = {
      limit: 20,
    };

    const result = paginationSchema.parse(pagination);
    expect(result.page).toBe(1);
  });

  test('should default limit to 20', () => {
    const pagination = {
      page: 1,
    };

    const result = paginationSchema.parse(pagination);
    expect(result.limit).toBe(20);
  });

  test('should reject limit above 100', () => {
    const invalidPagination = {
      page: 1,
      limit: 150,
    };

    expect(() => paginationSchema.parse(invalidPagination)).toThrow('cannot exceed 100');
  });
});

describe('Payment Verification Schema', () => {
  test('should validate valid payment verification data', () => {
    const validPayment = {
      razorpayOrderId: 'order_123456',
      razorpayPaymentId: 'pay_123456',
      razorpaySignature: 'signature_123456',
    };

    const result = paymentVerificationSchema.parse(validPayment);
    expect(result.razorpayOrderId).toBe('order_123456');
  });

  test('should reject empty order ID', () => {
    const invalidPayment = {
      razorpayOrderId: '',
      razorpayPaymentId: 'pay_123456',
      razorpaySignature: 'signature_123456',
    };

    expect(() => paymentVerificationSchema.parse(invalidPayment)).toThrow('Order ID is required');
  });
});

describe('Order Status Schema', () => {
  test('should validate valid order status', () => {
    const validStatus = {
      status: 'SHIPPED' as const,
    };

    const result = orderStatusSchema.parse(validStatus);
    expect(result.status).toBe('SHIPPED');
  });

  test('should reject invalid status', () => {
    const invalidStatus = {
      status: 'INVALID_STATUS',
    };

    expect(() => orderStatusSchema.parse(invalidStatus)).toThrow();
  });
});

describe('Helper Functions', () => {
  describe('validateData', () => {
    test('should return parsed data for valid input', () => {
      const data = { email: 'test@example.com' };
      const result = validateData(newsletterSchema, data);
      expect(result.email).toBe('test@example.com');
    });

    test('should throw error for invalid input', () => {
      const data = { email: 'not-an-email' };
      expect(() => validateData(newsletterSchema, data)).toThrow();
    });
  });

  describe('validateDataSafe', () => {
    test('should return success for valid input', () => {
      const data = { email: 'test@example.com' };
      const result = validateDataSafe(newsletterSchema, data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
      }
    });

    test('should return error for invalid input', () => {
      const data = { email: 'not-an-email' };
      const result = validateDataSafe(newsletterSchema, data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('formatValidationErrors', () => {
    test('should format validation errors', () => {
      const data = { email: 'not-an-email' };
      const result = newsletterSchema.safeParse(data);
      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        expect(formatted).toBeInstanceOf(Array);
        expect(formatted.length).toBeGreaterThan(0);
        expect(formatted[0]).toContain('email');
      } else {
        throw new Error('Expected validation to fail');
      }
    });
  });
});
