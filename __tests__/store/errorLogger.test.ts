import { rtkQueryErrorLogger } from '@app/store/middleware/errorLogger';
import { logger } from '@shared/utils/logger';

const invokeMiddleware = (next: jest.Mock) =>
  (
    rtkQueryErrorLogger({} as never) as (
      next: jest.Mock,
    ) => (action: unknown) => unknown
  )(next);

describe('rtkQueryErrorLogger', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs rejected-with-value actions and forwards them', () => {
    const errorSpy = jest
      .spyOn(logger, 'error')
      .mockImplementation(() => undefined);
    const next = jest.fn();
    const invoke = invokeMiddleware(next);

    const action = {
      type: 'moviesApi/executeQuery/rejected',
      payload: { status: 500, data: { message: 'nope' } },
      meta: {
        rejectedWithValue: true,
        requestStatus: 'rejected',
        requestId: 'req-1',
      },
    };

    invoke(action);

    expect(errorSpy).toHaveBeenCalledWith(
      'RTK Query request failed',
      { endpoint: action.type, status: 500 },
      { message: 'nope' },
    );
    expect(next).toHaveBeenCalledWith(action);
  });

  it('passes other actions through without logging', () => {
    const errorSpy = jest
      .spyOn(logger, 'error')
      .mockImplementation(() => undefined);
    const next = jest.fn();
    const invoke = invokeMiddleware(next);

    const action = { type: 'movies/setSelectedCategory' };
    invoke(action);

    expect(errorSpy).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(action);
  });
});
