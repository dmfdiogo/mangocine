import { isRejectedWithValue, Middleware } from '@reduxjs/toolkit';

/**
 * Global Redux middleware for logging and monitoring RTK Query errors.
 * Catches any rejected action from API queries or mutations.
 */
export const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const payload = action.payload as { status?: number | string; data?: unknown };
    if (__DEV__) {
      console.warn(
        `[RTK Query Error] Endpoint: "${action.type}", Status: ${payload?.status ?? 'UNKNOWN'}`,
        payload?.data
      );
    }
  }

  return next(action);
};
