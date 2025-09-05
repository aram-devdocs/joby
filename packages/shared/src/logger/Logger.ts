import type {
  LogLevel,
  LogEntry,
  LoggerTransport,
  LoggerConfig,
} from './types';
import { LOG_LEVELS } from './types';

export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private transports: LoggerTransport[] = [];
  private contextStack: Record<string, unknown>[] = [];

  private constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: config?.level || 'info',
      transports: config?.transports || [],
      context: config?.context || {},
      source: config?.source || this.detectSource(),
    };
    this.transports = this.config.transports;
  }

  static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  static configure(config: Partial<LoggerConfig>): void {
    const instance = Logger.getInstance();
    instance.updateConfig(config);
  }

  static addTransport(transport: LoggerTransport): void {
    const instance = Logger.getInstance();
    instance.addTransport(transport);
  }

  static removeTransport(name: string): void {
    const instance = Logger.getInstance();
    instance.removeTransport(name);
  }

  // Static convenience methods
  static trace(message: string, context?: Record<string, unknown>): void {
    Logger.getInstance().trace(message, context);
  }

  static debug(message: string, context?: Record<string, unknown>): void {
    Logger.getInstance().debug(message, context);
  }

  static info(message: string, context?: Record<string, unknown>): void {
    Logger.getInstance().info(message, context);
  }

  static warn(message: string, context?: Record<string, unknown>): void {
    Logger.getInstance().warn(message, context);
  }

  static error(
    message: string,
    error?: Error | unknown,
    context?: Record<string, unknown>,
  ): void {
    Logger.getInstance().error(message, error, context);
  }

  static withContext(context: Record<string, unknown>): Logger {
    return Logger.getInstance().withContext(context);
  }

  static time(label: string): void {
    Logger.getInstance().time(label);
  }

  static timeEnd(label: string): void {
    Logger.getInstance().timeEnd(label);
  }

  // Instance methods
  updateConfig(config: Partial<LoggerConfig>): void {
    if (config.level) this.config.level = config.level;
    if (config.transports) this.transports = config.transports;
    if (config.context)
      this.config.context = { ...this.config.context, ...config.context };
    if (config.source) this.config.source = config.source;
  }

  addTransport(transport: LoggerTransport): void {
    if (!this.transports.find((t) => t.name === transport.name)) {
      this.transports.push(transport);
    }
  }

  removeTransport(name: string): void {
    this.transports = this.transports.filter((t) => t.name !== name);
  }

  trace(message: string, context?: Record<string, unknown>): void {
    this.log('trace', message, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(
    message: string,
    error?: Error | unknown,
    context?: Record<string, unknown>,
  ): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const logContext = {
      ...context,
      error: {
        message: errorObj.message,
        stack: errorObj.stack,
        name: errorObj.name,
      },
    };
    this.log('error', message, logContext);
  }

  withContext(context: Record<string, unknown>): Logger {
    const childLogger = Object.create(this);
    childLogger.contextStack = [...this.contextStack, context];
    return childLogger;
  }

  private timers = new Map<string, number>();

  time(label: string): void {
    this.timers.set(label, Date.now());
    this.debug(`Timer started: ${label}`);
  }

  timeEnd(label: string): void {
    const start = this.timers.get(label);
    if (start) {
      const duration = Date.now() - start;
      this.timers.delete(label);
      this.debug(`Timer ended: ${label}`, { duration: `${duration}ms` });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): void {
    if (!this.shouldLog(level)) return;

    const mergedContext = this.contextStack.reduce(
      (acc, ctx) => ({ ...acc, ...ctx }),
      { ...this.config.context, ...context },
    );

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      source: this.config.source || this.detectSource(),
      ...(Object.keys(mergedContext).length > 0 && { context: mergedContext }),
    };

    // Send to all enabled transports
    this.transports.forEach((transport) => {
      if (transport.isEnabled) {
        try {
          transport.log(entry);
        } catch {
          // Avoid recursive logging - silently fail
          // Transport errors should not break the application
        }
      }
    });
  }

  private detectSource(): string {
    if (typeof window !== 'undefined') {
      return 'renderer';
    } else if (
      typeof process !== 'undefined' &&
      (process as unknown as Record<string, unknown>).type === 'browser'
    ) {
      return 'main';
    } else if (
      typeof process !== 'undefined' &&
      (process as unknown as Record<string, unknown>).type === 'renderer'
    ) {
      return 'renderer';
    } else {
      return 'unknown';
    }
  }

  async flush(): Promise<void> {
    await Promise.all(
      this.transports
        .filter((t) => t.isEnabled && t.flush)
        .map((t) => (t.flush ? t.flush() : Promise.resolve())),
    );
  }
}
