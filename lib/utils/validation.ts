/**
 * Validation Schemas
 *
 * All user inputs must be validated using these Zod schemas
 * to prevent injection attacks and ensure data integrity.
 */

import { z } from 'zod';

/**
 * Sanitize string input to prevent XSS
 * Removes potentially dangerous characters and HTML tags
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize HTML content (for rich text)
 * For production, consider using a library like DOMPurify
 */
export function sanitizeHtml(input: string): string {
  // Basic sanitization - remove script tags and dangerous attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
}

// ============================================================================
// Product Validation
// ============================================================================

export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(200, 'Product name must be less than 200 characters')
    .transform(sanitizeString),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200, 'Slug must be less than 200 characters')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase letters, numbers, and hyphens only'
    ),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .transform(sanitizeHtml),
  price: z
    .number()
    .int('Price must be an integer')
    .positive('Price must be positive')
    .max(1000000000, 'Price is too large'), // Max 10 million rupees
  categoryId: z.string().uuid('Invalid category ID'),
  stock: z
    .number()
    .int('Stock must be an integer')
    .nonnegative('Stock cannot be negative')
    .max(1000000, 'Stock value is too large'),
  images: z
    .array(z.string().url('Invalid image URL'))
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed'),
  isActive: z.boolean().default(true),
  nutritionalInfo: z
    .string()
    .max(1000)
    .optional()
    .transform((val) => (val ? sanitizeHtml(val) : val)),
});

export type ProductInput = z.infer<typeof productSchema>;

// ============================================================================
// Address Validation
// ============================================================================

export const addressSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name is too long')
    .transform(sanitizeString),
  addressLine1: z
    .string()
    .min(1, 'Address line 1 is required')
    .max(255, 'Address line 1 is too long')
    .transform(sanitizeString),
  addressLine2: z
    .string()
    .max(255, 'Address line 2 is too long')
    .optional()
    .transform((val) => (val ? sanitizeString(val) : val)),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City name is too long')
    .transform(sanitizeString),
  state: z
    .string()
    .min(1, 'State is required')
    .max(100, 'State name is too long')
    .transform(sanitizeString),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

// ============================================================================
// Review Validation
// ============================================================================

export const reviewSchema = z.object({
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  comment: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(500, 'Review must be less than 500 characters')
    .transform(sanitizeHtml),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

// ============================================================================
// Cart Item Validation
// ============================================================================

export const cartItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .positive('Quantity must be positive')
    .max(1000, 'Quantity is too large'),
});

export type CartItemInput = z.infer<typeof cartItemSchema>;

// ============================================================================
// Order Validation
// ============================================================================

export const orderSchema = z.object({
  shippingAddress: addressSchema,
  couponCode: z
    .string()
    .max(50, 'Coupon code is too long')
    .optional()
    .transform((val) => (val ? sanitizeString(val) : val)),
});

export type OrderInput = z.infer<typeof orderSchema>;

// ============================================================================
// Coupon Validation
// ============================================================================

export const couponSchema = z.object({
  code: z
    .string()
    .min(1, 'Coupon code is required')
    .max(50, 'Coupon code is too long')
    .regex(
      /^[A-Z0-9_-]+$/,
      'Coupon code must be uppercase letters, numbers, underscores, and hyphens only'
    ),
  discountType: z.enum(['PERCENTAGE', 'FLAT']),
  discountValue: z
    .number()
    .int('Discount value must be an integer')
    .positive('Discount value must be positive'),
  minOrderValue: z
    .number()
    .int('Minimum order value must be an integer')
    .nonnegative('Minimum order value cannot be negative')
    .default(0),
  maxUses: z.number().int('Max uses must be an integer').positive('Max uses must be positive'),
  expiresAt: z.date().refine((date) => date > new Date(), {
    message: 'Expiration date must be in the future',
  }),
});

export type CouponInput = z.infer<typeof couponSchema>;

// ============================================================================
// User Profile Validation
// ============================================================================

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name is too long')
    .transform(sanitizeString),
  email: z.string().email('Invalid email address').max(255, 'Email is too long').toLowerCase(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// ============================================================================
// Newsletter Subscription Validation
// ============================================================================

export const newsletterSchema = z.object({
  email: z.string().email('Invalid email address').max(255, 'Email is too long').toLowerCase(),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

// ============================================================================
// Search Query Validation
// ============================================================================

export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(1, 'Search query is required')
    .max(200, 'Search query is too long')
    .transform(sanitizeString),
  category: z.string().uuid().optional(),
  sort: z.enum(['price-asc', 'price-desc', 'newest']).optional(),
  priceMin: z.number().int().nonnegative().optional(),
  priceMax: z.number().int().positive().optional(),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

// ============================================================================
// Pagination Validation
// ============================================================================

export const paginationSchema = z.object({
  page: z.number().int('Page must be an integer').positive('Page must be positive').default(1),
  limit: z
    .number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ============================================================================
// Payment Validation
// ============================================================================

export const paymentVerificationSchema = z.object({
  razorpayOrderId: z.string().min(1, 'Order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Payment ID is required'),
  razorpaySignature: z.string().min(1, 'Signature is required'),
});

export type PaymentVerificationInput = z.infer<typeof paymentVerificationSchema>;

// ============================================================================
// Order Status Update Validation
// ============================================================================

export const orderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

export type OrderStatusInput = z.infer<typeof orderStatusSchema>;

// ============================================================================
// Image Upload Validation
// ============================================================================

export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024, // 5MB
      'File size must be less than 5MB'
    )
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'File must be JPEG, PNG, or WebP'
    ),
});

export type ImageUploadInput = z.infer<typeof imageUploadSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate and parse data with a Zod schema
 * Returns parsed data or throws validation error
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Validate and parse data with a Zod schema (safe version)
 * Returns success/error result without throwing
 */
export function validateDataSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Format Zod validation errors for user display
 */
export function formatValidationErrors(error: z.ZodError): string[] {
  return error.issues.map((err: z.ZodIssue) => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  });
}
