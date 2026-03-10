import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
// biome-ignore lint/correctness/noUnusedImports: Required for TypeScript
import { afterEach, expect, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables for tests
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/doon_farm_dev';
process.env.AUTH_SECRET = 'test-secret-key-for-testing-only';
process.env.AUTH_URL = 'http://localhost:3000';
process.env.RAZORPAY_KEY_ID = 'test_razorpay_key_id';
process.env.RAZORPAY_KEY_SECRET = 'test_razorpay_key_secret';
process.env.RESEND_API_KEY = 'test_resend_api_key';
process.env.FROM_EMAIL = 'test@example.com';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_AUTH_URL = 'http://localhost:3000';

// ============================================================================
// Fluent chainable mock builder for Drizzle ORM
// ============================================================================

/**
 * Creates a fluent chainable mock that resolves to `resolveValue` when awaited.
 * Every chainable method (select, from, where, limit, offset, orderBy,
 * leftJoin, innerJoin, returning, set, values, $dynamic) returns the same
 * chain object so that ANY call ordering works.
 *
 * Uses a Proxy around a real Promise so that `.then` / `.catch` / `.finally`
 * delegate to the native Promise (avoiding Biome's noThenProperty rule) while
 * every Drizzle-style chaining method returns a new proxied Promise.
 */
type ChainMethod = (...args: unknown[]) => ChainProxy;
type ChainProxy = Record<string, ChainMethod> & Promise<unknown>;

export function createDrizzleChain(resolveValue: unknown = []): ChainProxy {
  const methods = [
    'select',
    'from',
    'where',
    'limit',
    'offset',
    'orderBy',
    'leftJoin',
    'innerJoin',
    'returning',
    'set',
    'values',
    '$dynamic',
    'groupBy',
    'having',
  ];
  const promise = Promise.resolve(resolveValue);
  const handler: ProxyHandler<Promise<unknown>> = {
    get(target, prop: string) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return (target[prop as keyof Promise<unknown>] as (...args: never[]) => unknown).bind(
          target
        );
      }
      if (methods.includes(prop)) {
        return () => new Proxy(promise, handler) as ChainProxy;
      }
      return undefined;
    },
  };
  return new Proxy(promise, handler) as ChainProxy;
}

/**
 * Creates a sequence of chainable mocks. Each call to db.select() (or other
 * entry point) will consume the next resolve value from the list.
 *
 * Usage:
 *   const mock = createDrizzleChainSequence([resultA, resultB, resultC]);
 *   vi.spyOn(db, 'select').mockImplementation(() => mock());
 */
export function createDrizzleChainSequence(resolveValues: unknown[]) {
  let callIndex = 0;
  return () => {
    const value = resolveValues[callIndex] ?? [];
    callIndex++;
    return createDrizzleChain(value);
  };
}

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
  redirect: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
  headers: () => ({
    get: vi.fn(),
  }),
}));
