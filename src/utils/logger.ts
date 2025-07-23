/**
 * === SOLID: SRP - Single Responsibility ===
 * Centralized logging utility with environment-based control
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

export interface LogContext {
  service?: string;
  component?: string;
  method?: string;
  userId?: string;
  lessonId?: string;
  slideId?: string;
  ageGroup?: string;
  configId?: string;
  count?: number;
  duration?: number;
  topic?: string;
  title?: string;
  slideCount?: number;
}

class Logger {
  private currentLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.currentLevel = this.getLogLevelFromEnv();
  }

  private getLogLevelFromEnv(): LogLevel {
    const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL?.toUpperCase() || 'INFO';
    
    switch (envLevel) {
      case 'DEBUG': return LogLevel.DEBUG;
      case 'INFO': return LogLevel.INFO;
      case 'WARN': return LogLevel.WARN;
      case 'ERROR': return LogLevel.ERROR;
      case 'NONE': return LogLevel.NONE;
      default: return this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${Object.entries(context).map(([k, v]) => `${k}:${v}`).join(', ')}]` : '';
    return `${timestamp} [${level}]${contextStr} ${message}`;
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    console.log(this.formatMessage('DEBUG', message, context));
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    console.info(this.formatMessage('INFO', message, context));
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    console.warn(this.formatMessage('WARN', message, context));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    console.error(this.formatMessage('ERROR', message, context), error);
  }

  // === Service-specific loggers ===
  
  generation = {
    debug: (message: string, context?: Omit<LogContext, 'service'>) => 
      this.debug(message, { ...context, service: 'generation' }),
    info: (message: string, context?: Omit<LogContext, 'service'>) => 
      this.info(message, { ...context, service: 'generation' }),
    warn: (message: string, context?: Omit<LogContext, 'service'>) => 
      this.warn(message, { ...context, service: 'generation' }),
    error: (message: string, error?: Error, context?: Omit<LogContext, 'service'>) => 
      this.error(message, error, { ...context, service: 'generation' })
  };

  chat = {
    debug: (message: string, context?: Omit<LogContext, 'service'>) => 
      this.debug(message, { ...context, service: 'chat' }),
    info: (message: string, context?: Omit<LogContext, 'service'>) => 
      this.info(message, { ...context, service: 'chat' }),
    warn: (message: string, context?: Omit<LogContext, 'service'>) => 
      this.warn(message, { ...context, service: 'chat' }),
    error: (message: string, error?: Error, context?: Omit<LogContext, 'service'>) => 
      this.error(message, error, { ...context, service: 'chat' })
  };

  slides = {
    debug: (message: string, context?: Omit<LogContext, 'service'>) => 
      this.debug(message, { ...context, service: 'slides' }),
    info: (message: string, context?: Omit<LogContext, 'service'>) => 
      this.info(message, { ...context, service: 'slides' }),
    warn: (message: string, context?: Omit<LogContext, 'service'>) => 
      this.warn(message, { ...context, service: 'slides' }),
    error: (message: string, error?: Error, context?: Omit<LogContext, 'service'>) => 
      this.error(message, error, { ...context, service: 'slides' })
  };

  api = {
    debug: (message: string, context?: Omit<LogContext, 'service'>) => 
      this.debug(message, { ...context, service: 'api' }),
    info: (message: string, context?: Omit<LogContext, 'service'>) => 
      this.info(message, { ...context, service: 'api' }),
    warn: (message: string, context?: Omit<LogContext, 'service'>) => 
      this.warn(message, { ...context, service: 'api' }),
    error: (message: string, error?: Error, context?: Omit<LogContext, 'service'>) => 
      this.error(message, error, { ...context, service: 'api' })
  };
}

// === SOLID: SRP - Singleton instance ===
export const logger = new Logger();

// === Convenience functions for backward compatibility ===
export const log = logger;

// === Performance measurement utility ===
export function measurePerformance<T>(
  operation: () => Promise<T> | T,
  operationName: string,
  context?: LogContext
): Promise<T> | T {
  const start = performance.now();
  
  const logResult = (result: T) => {
    const duration = performance.now() - start;
    logger.debug(`${operationName} completed in ${duration.toFixed(2)}ms`, context);
    return result;
  };

  try {
    const result = operation();
    
    if (result instanceof Promise) {
      return result.then(logResult).catch(error => {
        const duration = performance.now() - start;
        logger.error(`${operationName} failed after ${duration.toFixed(2)}ms`, error, context);
        throw error;
      });
    }
    
    return logResult(result);
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`${operationName} failed after ${duration.toFixed(2)}ms`, error as Error, context);
    throw error;
  }
} 