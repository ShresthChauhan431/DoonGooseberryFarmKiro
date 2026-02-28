/**
 * Security Event Logger
 *
 * Logs security-related events for monitoring and incident response.
 * Integrates with Sentry for production monitoring.
 */

import * as Sentry from '@sentry/nextjs';

export enum SecurityEventType {
  FAILED_LOGIN = 'FAILED_LOGIN',
  INVALID_PAYMENT_SIGNATURE = 'INVALID_PAYMENT_SIGNATURE',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_CSRF_TOKEN = 'INVALID_CSRF_TOKEN',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  ADMIN_ACTION = 'ADMIN_ACTION',
  DATA_EXPORT = 'DATA_EXPORT',
}

export enum SecurityEventSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface SecurityEvent {
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  message: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * Log a security event
 * Logs to console in development, sends to Sentry in production
 */
export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: new Date(),
  };

  // Format log message
  const logMessage = formatSecurityEvent(fullEvent);

  // Log to console
  if (process.env.NODE_ENV === 'development') {
    console.warn('🔒 Security Event:', logMessage);
  }

  // Send to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(logMessage, {
      level: getSentryLevel(event.severity),
      tags: {
        security_event: event.type,
        severity: event.severity,
      },
      extra: {
        userId: event.userId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        metadata: event.metadata,
      },
    });
  }

  // Store in database for audit trail (optional)
  // await storeSecurityEvent(fullEvent);
}

/**
 * Log failed login attempt
 */
export function logFailedLogin(email: string, ipAddress: string, userAgent?: string): void {
  logSecurityEvent({
    type: SecurityEventType.FAILED_LOGIN,
    severity: SecurityEventSeverity.MEDIUM,
    message: `Failed login attempt for email: ${email}`,
    ipAddress,
    userAgent,
    metadata: { email },
  });
}

/**
 * Log invalid payment signature
 */
export function logInvalidPaymentSignature(
  orderId: string,
  paymentId: string,
  ipAddress: string
): void {
  logSecurityEvent({
    type: SecurityEventType.INVALID_PAYMENT_SIGNATURE,
    severity: SecurityEventSeverity.CRITICAL,
    message: `Invalid payment signature detected for order ${orderId}`,
    ipAddress,
    metadata: {
      orderId,
      paymentId,
    },
  });
}

/**
 * Log unauthorized access attempt
 */
export function logUnauthorizedAccess(
  path: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): void {
  logSecurityEvent({
    type: SecurityEventType.UNAUTHORIZED_ACCESS,
    severity: SecurityEventSeverity.HIGH,
    message: `Unauthorized access attempt to ${path}`,
    userId,
    ipAddress,
    userAgent,
    metadata: { path },
  });
}

/**
 * Log rate limit violation
 */
export function logRateLimitExceeded(endpoint: string, ipAddress: string, limit: number): void {
  logSecurityEvent({
    type: SecurityEventType.RATE_LIMIT_EXCEEDED,
    severity: SecurityEventSeverity.MEDIUM,
    message: `Rate limit exceeded for ${endpoint} (limit: ${limit})`,
    ipAddress,
    metadata: {
      endpoint,
      limit,
    },
  });
}

/**
 * Log invalid CSRF token
 */
export function logInvalidCsrfToken(ipAddress: string, userAgent?: string): void {
  logSecurityEvent({
    type: SecurityEventType.INVALID_CSRF_TOKEN,
    severity: SecurityEventSeverity.HIGH,
    message: 'Invalid CSRF token detected',
    ipAddress,
    userAgent,
  });
}

/**
 * Log suspicious activity
 */
export function logSuspiciousActivity(
  description: string,
  userId?: string,
  ipAddress?: string,
  metadata?: Record<string, any>
): void {
  logSecurityEvent({
    type: SecurityEventType.SUSPICIOUS_ACTIVITY,
    severity: SecurityEventSeverity.HIGH,
    message: `Suspicious activity: ${description}`,
    userId,
    ipAddress,
    metadata,
  });
}

/**
 * Log admin action
 */
export function logAdminAction(
  action: string,
  userId: string,
  ipAddress?: string,
  metadata?: Record<string, any>
): void {
  logSecurityEvent({
    type: SecurityEventType.ADMIN_ACTION,
    severity: SecurityEventSeverity.LOW,
    message: `Admin action: ${action}`,
    userId,
    ipAddress,
    metadata,
  });
}

/**
 * Log password reset request
 */
export function logPasswordResetRequest(email: string, ipAddress: string): void {
  logSecurityEvent({
    type: SecurityEventType.PASSWORD_RESET_REQUESTED,
    severity: SecurityEventSeverity.LOW,
    message: `Password reset requested for ${email}`,
    ipAddress,
    metadata: { email },
  });
}

/**
 * Format security event for logging
 */
function formatSecurityEvent(event: SecurityEvent): string {
  const parts = [`[${event.severity}]`, `[${event.type}]`, event.message];

  if (event.userId) {
    parts.push(`User: ${event.userId}`);
  }

  if (event.ipAddress) {
    parts.push(`IP: ${event.ipAddress}`);
  }

  return parts.join(' ');
}

/**
 * Convert security severity to Sentry level
 */
function getSentryLevel(severity: SecurityEventSeverity): Sentry.SeverityLevel {
  switch (severity) {
    case SecurityEventSeverity.LOW:
      return 'info';
    case SecurityEventSeverity.MEDIUM:
      return 'warning';
    case SecurityEventSeverity.HIGH:
      return 'error';
    case SecurityEventSeverity.CRITICAL:
      return 'fatal';
    default:
      return 'warning';
  }
}

/**
 * Get client information from request
 */
export function getClientInfo(request: Request): {
  ipAddress: string;
  userAgent?: string;
} {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  const ipAddress = cfConnectingIp || realIp || forwardedFor?.split(',')[0] || 'unknown';
  const userAgent = request.headers.get('user-agent') || undefined;

  return {
    ipAddress: ipAddress.trim(),
    userAgent,
  };
}

/**
 * Security Event Statistics
 * Track security events for monitoring dashboard
 */
export interface SecurityStats {
  failedLogins: number;
  unauthorizedAccess: number;
  rateLimitViolations: number;
  invalidPayments: number;
  suspiciousActivity: number;
}

/**
 * Get security statistics for a time period
 * This would query a database table of security events
 */
export async function getSecurityStats(startDate: Date, endDate: Date): Promise<SecurityStats> {
  // TODO: Implement database query
  // For now, return mock data
  return {
    failedLogins: 0,
    unauthorizedAccess: 0,
    rateLimitViolations: 0,
    invalidPayments: 0,
    suspiciousActivity: 0,
  };
}

/**
 * Security Event Storage (Optional)
 *
 * For compliance and audit requirements, you may want to store
 * security events in a database table:
 *
 * CREATE TABLE security_events (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   type VARCHAR(50) NOT NULL,
 *   severity VARCHAR(20) NOT NULL,
 *   message TEXT NOT NULL,
 *   user_id UUID,
 *   ip_address VARCHAR(45),
 *   user_agent TEXT,
 *   metadata JSONB,
 *   created_at TIMESTAMP NOT NULL DEFAULT NOW()
 * );
 *
 * CREATE INDEX idx_security_events_type ON security_events(type);
 * CREATE INDEX idx_security_events_severity ON security_events(severity);
 * CREATE INDEX idx_security_events_user_id ON security_events(user_id);
 * CREATE INDEX idx_security_events_created_at ON security_events(created_at);
 */

/**
 * Example Usage:
 *
 * // In authentication Server Action
 * const result = await signIn(email, password);
 * if (!result.success) {
 *   const { ipAddress, userAgent } = getClientInfo(request);
 *   logFailedLogin(email, ipAddress, userAgent);
 * }
 *
 * // In payment verification
 * const isValid = verifyPaymentSignature(orderId, paymentId, signature);
 * if (!isValid) {
 *   const { ipAddress } = getClientInfo(request);
 *   logInvalidPaymentSignature(orderId, paymentId, ipAddress);
 * }
 *
 * // In admin middleware
 * if (user.role !== 'ADMIN') {
 *   const { ipAddress, userAgent } = getClientInfo(request);
 *   logUnauthorizedAccess(path, user.id, ipAddress, userAgent);
 * }
 */
