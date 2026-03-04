/**
 * Simple error logger utility.
 * In a production app, this would send to Sentry or Axiom.
 */

export function logError(error: Error, context?: Record<string, any>) {
  const timestamp = new Date().toISOString();
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp,
  };

  // Currently just logging to console, but ready for extension
  console.error("[Mythos Error]", JSON.stringify(errorDetails, null, 2));

  // Placeholder for Sentry/etc.
  // Sentry.captureException(error, { extra: context });
}

export function logActivity(userId: string, action: string, metadata?: Record<string, any>) {
  console.log(`[Activity] User ${userId} performed ${action}`, metadata);
}
