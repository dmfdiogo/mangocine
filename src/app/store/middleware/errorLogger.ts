import { isRejectedWithValue, Middleware } from '@reduxjs/toolkit';
import { logger } from '@shared/utils/logger';

interface RejectedPayload {
  status?: number | string;
  data?: unknown;
}

/**
 * Global Redux middleware for logging and monitoring RTK Query errors.
 * Catches any rejected action from API queries or mutations and forwards it to
 * the structured logger (which can later ship records to a crash reporter).
 */
export const rtkQueryErrorLogger: Middleware = () => next => action => {
  if (isRejectedWithValue(action)) {
    const payload = action.payload as RejectedPayload | undefined;

    logger.error(
      'RTK Query request failed',
      {
        endpoint: action.type,
        status: payload?.status ?? 'UNKNOWN',
      },
      payload?.data,
    );
  }

  return next(action);
};
