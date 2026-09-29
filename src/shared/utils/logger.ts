/**
 * Minimal structured logger with zero runtime dependencies.
 *
 * Every record is a plain object (`LogEntry`) so it can be inspected in tests
 * and forwarded to any sink (console in dev, crash reporter in production)
 * through pluggable *transports*. This keeps the app decoupled from a specific
 * observability vendor while giving us consistent, greppable output.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface SerializedError {
  name: string;
  message: string;
  stack?: string;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: SerializedError;
}

export type LogTransport = (entry: LogEntry) => void;

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const LEVEL_TAG: Record<LogLevel, string> = {
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
};

const CONSOLE_METHOD: Record<LogLevel, 'log' | 'info' | 'warn' | 'error'> = {
  debug: 'log',
  info: 'info',
  warn: 'warn',
  error: 'error',
};

export const serializeError = (error: unknown): SerializedError => {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  if (typeof error === 'string') {
    return { name: 'Error', message: error };
  }
  return { name: 'UnknownError', message: String(error) };
};

/** Default sink: writes the entry to the console. Gated by `__DEV__` by the logger. */
export const consoleTransport: LogTransport = entry => {
  const { level, message, context, error } = entry;
  const prefix = `[${LEVEL_TAG[level]}]`;
  const method = console[CONSOLE_METHOD[level]];

  if (context && error) {
    method(prefix, message, context, error);
  } else if (context) {
    method(prefix, message, context);
  } else if (error) {
    method(prefix, message, error);
  } else {
    method(prefix, message);
  }
};

export interface LoggerConfig {
  minLevel?: LogLevel;
  transports?: LogTransport[];
  /** When false, debug/info are dropped even if `minLevel` allows them. */
  enabled?: boolean;
}

export class Logger {
  private minLevel: LogLevel;
  private transports: LogTransport[];
  private enabled: boolean;

  constructor(config: LoggerConfig = {}) {
    this.minLevel = config.minLevel ?? (__DEV__ ? 'debug' : 'warn');
    // Console output is a dev-only convenience; in production no transport is
    // attached unless a crash reporter is configured explicitly.
    this.transports = config.transports ?? (__DEV__ ? [consoleTransport] : []);
    this.enabled = config.enabled ?? true;
  }

  /** Reconfigures the logger at runtime (e.g. wire a crash reporter later). */
  configure(config: LoggerConfig): void {
    if (config.minLevel !== undefined) this.minLevel = config.minLevel;
    if (config.transports !== undefined) this.transports = config.transports;
    if (config.enabled !== undefined) this.enabled = config.enabled;
  }

  debug(message: string, context?: LogContext): void {
    this.write('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.write('info', message, context);
  }

  warn(message: string, context?: LogContext, error?: unknown): void {
    this.write('warn', message, context, error);
  }

  error(message: string, context?: LogContext, error?: unknown): void {
    this.write('error', message, context, error);
  }

  private write(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: unknown,
  ): void {
    if (!this.enabled) return;
    if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[this.minLevel]) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(context ? { context } : {}),
      ...(error !== undefined ? { error: serializeError(error) } : {}),
    };

    for (const transport of this.transports) {
      try {
        transport(entry);
      } catch {
        // A broken transport must never crash the app.
      }
    }
  }
}

/** App-wide logger instance. */
export const logger = new Logger();
