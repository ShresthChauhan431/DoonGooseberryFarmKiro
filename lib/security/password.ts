/**
 * Password Security Configuration
 *
 * Better Auth automatically handles password hashing using bcrypt with:
 * - Salt rounds: 12 (industry standard for strong security)
 * - Automatic salting for each password
 * - Secure comparison to prevent timing attacks
 *
 * SECURITY RULES:
 * 1. NEVER log passwords (plaintext or hashed)
 * 2. NEVER store plaintext passwords
 * 3. NEVER expose password hashes to the client
 * 4. NEVER compare passwords using === (use bcrypt.compare)
 * 5. ALWAYS use Better Auth's built-in password handling
 */

import bcrypt from 'bcryptjs';

// Salt rounds for bcrypt (12 is recommended for production)
const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 * Note: Better Auth handles this automatically. This is for reference only.
 *
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  // NEVER log the password
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  return hash;
}

/**
 * Verify a password against a hash
 * Note: Better Auth handles this automatically. This is for reference only.
 *
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // NEVER log the password or hash
  return bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 *
 * @param password - Password to validate
 * @returns Object with isValid and error message
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one number',
    };
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one special character',
    };
  }

  return { isValid: true };
}

/**
 * Check if password has been compromised (basic check)
 * For production, consider integrating with Have I Been Pwned API
 *
 * @param password - Password to check
 * @returns True if password appears compromised
 */
export function isCommonPassword(password: string): boolean {
  const commonPasswords = [
    'password',
    '12345678',
    'qwerty',
    'abc123',
    'password123',
    'admin',
    'letmein',
    'welcome',
    'monkey',
    '1234567890',
  ];

  return commonPasswords.includes(password.toLowerCase());
}
