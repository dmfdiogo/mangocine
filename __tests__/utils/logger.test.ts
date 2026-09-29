import {
  Logger,
  LogEntry,
  consoleTransport,
  serializeError,
} from '@shared/utils/logger';

const collect = () => {
  const entries: LogEntry[] = [];
  return { entries, transport: (entry: LogEntry) => entries.push(entry) };
};

describe('Logger', () => {
  it('emits structured entries with level, message and timestamp', () => {
    const { entries, transport } = collect();
    const logger = new Logger({ minLevel: 'debug', transports: [transport] });

    logger.info('hello', { userId: 7 });

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      level: 'info',
      message: 'hello',
      context: { userId: 7 },
    });
    expect(new Date(entries[0].timestamp).toString()).not.toBe('Invalid Date');
  });

  it('drops records below the configured minimum level', () => {
    const { entries, transport } = collect();
    const logger = new Logger({ minLevel: 'warn', transports: [transport] });

    logger.debug('nope');
    logger.info('nope');
    logger.warn('kept');

    expect(entries).toHaveLength(1);
    expect(entries[0].level).toBe('warn');
  });

  it('serializes Error instances attached to a record', () => {
    const { entries, transport } = collect();
    const logger = new Logger({ minLevel: 'debug', transports: [transport] });

    logger.error('boom', { endpoint: 'getMovies' }, new Error('kaboom'));

    expect(entries[0].error).toEqual({
      name: 'Error',
      message: 'kaboom',
      stack: expect.any(String),
    });
  });

  it('survives a throwing transport', () => {
    const { entries, transport } = collect();
    const logger = new Logger({ minLevel: 'debug', transports: [transport] });

    logger.configure({
      transports: [
        () => {
          throw new Error('sink down');
        },
        transport,
      ],
    });

    expect(() => logger.error('still works')).not.toThrow();
    expect(entries).toHaveLength(1);
  });

  it('emits nothing when disabled', () => {
    const { entries, transport } = collect();
    const logger = new Logger({ enabled: false, transports: [transport] });

    logger.error('silenced');

    expect(entries).toHaveLength(0);
  });
});

describe('Logger configuration', () => {
  it('defaults to debug level in dev and can be reconfigured', () => {
    const { entries, transport } = collect();
    const logger = new Logger({ transports: [transport] });

    logger.debug('visible');
    logger.configure({ minLevel: 'error' });
    logger.info('hidden');
    logger.error('also visible');

    expect(entries.map(entry => entry.message)).toEqual([
      'visible',
      'also visible',
    ]);
  });

  it('can be enabled again after being disabled', () => {
    const { entries, transport } = collect();
    const logger = new Logger({ enabled: false, transports: [transport] });

    logger.error('dropped');
    logger.configure({ enabled: true });
    logger.error('kept');

    expect(entries.map(entry => entry.message)).toEqual(['kept']);
  });
});

describe('consoleTransport', () => {
  const baseEntry: LogEntry = {
    level: 'info',
    message: 'hello',
    timestamp: new Date().toISOString(),
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('routes each level to the matching console method', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const warn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    consoleTransport({ ...baseEntry, level: 'debug' });
    consoleTransport({ ...baseEntry, level: 'warn' });

    expect(log).toHaveBeenCalledWith('[DEBUG]', 'hello');
    expect(warn).toHaveBeenCalledWith('[WARN]', 'hello');
  });

  it('appends context, error, or both when present', () => {
    const info = jest
      .spyOn(console, 'info')
      .mockImplementation(() => undefined);
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    consoleTransport({ ...baseEntry, context: { a: 1 } });
    consoleTransport({
      ...baseEntry,
      level: 'error',
      error: { name: 'E', message: 'x' },
    });
    consoleTransport({
      ...baseEntry,
      level: 'error',
      context: { a: 1 },
      error: { name: 'E', message: 'x' },
    });

    expect(info).toHaveBeenCalledWith('[INFO]', 'hello', { a: 1 });
    expect(errorSpy).toHaveBeenNthCalledWith(1, '[ERROR]', 'hello', {
      name: 'E',
      message: 'x',
    });
    expect(errorSpy).toHaveBeenNthCalledWith(
      2,
      '[ERROR]',
      'hello',
      { a: 1 },
      { name: 'E', message: 'x' },
    );
  });
});

describe('serializeError', () => {
  it('handles Error, string and unknown values', () => {
    expect(serializeError(new Error('x'))).toMatchObject({ message: 'x' });
    expect(serializeError('plain')).toEqual({
      name: 'Error',
      message: 'plain',
    });
    expect(serializeError(42)).toEqual({
      name: 'UnknownError',
      message: '42',
    });
  });
});
