/**
 * Shared type definitions for the application.
 */

/**
 * Generic result type for all server actions.
 *
 * @template T - The shape of the `data` payload on success. Defaults to `void`
 *   (i.e. no data field expected).
 *
 * Usage examples:
 *   ActionResult                        → { success, message? }            (no data)
 *   ActionResult<{ orderId: number }>   → { success, message?, data? }     (typed data)
 */
export interface ActionResult<T = void> {
  success: boolean;
  message?: string;
  data?: T;
}
