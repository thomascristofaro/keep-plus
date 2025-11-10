/**
 * Logging Service
 * Provides comprehensive logging capabilities for metrics, errors, and debugging
 */

export const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  METRIC: 'METRIC'
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  stack?: string;
}

export interface Metric {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private enableConsole: boolean = true;
  private enableStorage: boolean = true;

  constructor() {
    this.loadLogsFromStorage();
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: any, context?: string): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  /**
   * Log an info message
   */
  info(message: string, data?: any, context?: string): void {
    this.log(LogLevel.INFO, message, data, context);
  }

  /**
   * Log a warning
   */
  warn(message: string, data?: any, context?: string): void {
    this.log(LogLevel.WARN, message, data, context);
  }

  /**
   * Log an error
   */
  error(message: string, error?: Error | any, context?: string): void {
    const stack = error instanceof Error ? error.stack : undefined;
    this.log(LogLevel.ERROR, message, error, context, stack);
  }

  /**
   * Log a metric
   */
  metric(metric: Metric): void {
    this.log(LogLevel.METRIC, `Metric: ${metric.name}`, metric);
  }

  /**
   * Core logging function
   */
  private log(
    level: LogLevel,
    message: string,
    data?: any,
    context?: string,
    stack?: string
  ): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      data,
      stack
    };

    // Add to in-memory logs
    this.logs.push(entry);

    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output
    if (this.enableConsole) {
      this.logToConsole(entry);
    }

    // Persist to storage
    if (this.enableStorage) {
      this.saveLogsToStorage();
    }
  }

  /**
   * Output log entry to console
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp.toISOString()}] [${entry.level}]${
      entry.context ? ` [${entry.context}]` : ''
    }`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data || '');
        break;
      case LogLevel.INFO:
      case LogLevel.METRIC:
        console.info(message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(message, entry.data || '');
        if (entry.stack) {
          console.error('Stack trace:', entry.stack);
        }
        break;
    }
  }

  /**
   * Save logs to localStorage
   */
  private saveLogsToStorage(): void {
    try {
      // Keep only last 500 logs in storage to avoid quota issues
      const recentLogs = this.logs.slice(-500);
      localStorage.setItem('app_logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.error('Failed to save logs to storage:', error);
    }
  }

  /**
   * Load logs from localStorage
   */
  private loadLogsFromStorage(): void {
    try {
      const stored = localStorage.getItem('app_logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load logs from storage:', error);
    }
  }

  /**
   * Get all logs
   */
  getLogs(filter?: { level?: LogLevel; context?: string; limit?: number }): LogEntry[] {
    let filtered = [...this.logs];

    if (filter?.level) {
      filtered = filtered.filter(log => log.level === filter.level);
    }

    if (filter?.context) {
      filtered = filtered.filter(log => log.context === filter.context);
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered;
  }

  /**
   * Get errors only
   */
  getErrors(limit?: number): LogEntry[] {
    return this.getLogs({ level: LogLevel.ERROR, limit });
  }

  /**
   * Get metrics only
   */
  getMetrics(limit?: number): LogEntry[] {
    return this.getLogs({ level: LogLevel.METRIC, limit });
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    try {
      localStorage.removeItem('app_logs');
    } catch (error) {
      console.error('Failed to clear logs from storage:', error);
    }
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Configure logger
   */
  configure(options: {
    maxLogs?: number;
    enableConsole?: boolean;
    enableStorage?: boolean;
  }): void {
    if (options.maxLogs !== undefined) {
      this.maxLogs = options.maxLogs;
    }
    if (options.enableConsole !== undefined) {
      this.enableConsole = options.enableConsole;
    }
    if (options.enableStorage !== undefined) {
      this.enableStorage = options.enableStorage;
    }
  }

  /**
   * Measure execution time of a function
   */
  async measureTime<T>(
    name: string,
    fn: () => Promise<T> | T,
    context?: string
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      this.metric({
        name: `${name}_duration`,
        value: duration,
        unit: 'ms',
        tags: { context: context || 'unknown' }
      });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.error(`${name} failed after ${duration.toFixed(2)}ms`, error, context);
      throw error;
    }
  }

  /**
   * Track page view
   */
  trackPageView(page: string): void {
    this.info(`Page view: ${page}`, { page }, 'navigation');
  }

  /**
   * Track user action
   */
  trackAction(action: string, data?: any): void {
    this.info(`User action: ${action}`, data, 'user-action');
  }

  /**
   * Track error boundary errors
   */
  trackErrorBoundary(error: Error, errorInfo: any): void {
    this.error('Error Boundary caught error', { error, errorInfo }, 'error-boundary');
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const logDebug = (message: string, data?: any, context?: string) =>
  logger.debug(message, data, context);

export const logInfo = (message: string, data?: any, context?: string) =>
  logger.info(message, data, context);

export const logWarn = (message: string, data?: any, context?: string) =>
  logger.warn(message, data, context);

export const logError = (message: string, error?: Error | any, context?: string) =>
  logger.error(message, error, context);

export const logMetric = (metric: Metric) => logger.metric(metric);

export const trackAction = (action: string, data?: any) =>
  logger.trackAction(action, data);

export default logger;
