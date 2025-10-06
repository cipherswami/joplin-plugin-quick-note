/*************************************************************
 * @file        logger.ts
 * @description Logger utility for Joplin plugins with dynamic
 *              log level control via browser console.
 * @usage
 * import { createLogger, LogLevel } from './logger';
 * const logger = createLogger('[PluginName]', LogLevel.INFO);
 * logger.info('Message');
 * 
 * // Browser console:
 * joplinLogger.setLevel(0)   // DEBUG
 * joplinLogger.getLevel()    // Get current level
 *************************************************************/

/**
 * Log level enumeration. Lower values = more verbose.
 * @enum {number}
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

/**
 * Logger class with configurable log levels.
 * @class
 */
export class Logger {
  private level: LogLevel;
  private prefix: string;

  /**
   * @param {LogLevel} level - Initial log level threshold
   * @param {string} prefix - Prefix for log messages (e.g., '[PluginName]')
   */
  constructor(level: LogLevel, prefix: string) {
    this.level = level;
    this.prefix = prefix;
  }

  /**
   * Updates the log level threshold.
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Gets the current log level.
   */
  getLevel(): LogLevel {
    return this.level;
  }

  debug(...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(this.prefix, 'DEBUG :', ...args);
    }
  }

  info(...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(this.prefix, 'INFO  :', ...args);
    }
  }

  warn(...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.prefix, 'WARN  :', ...args);
    }
  }

  error(...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.prefix, 'ERROR :', ...args);
    }
  }
}

// Current logger instance - accessible from browser console
let currentLogger: Logger | null = null;

/**
 * Creates a logger instance and exposes controls to browser console.
 * Console API: joplinLogger.setLevel(), joplinLogger.getLevel()
 * 
 * @param {string} prefix - Plugin identifier (e.g., '[MyPlugin]')
 * @param {LogLevel} [level=LogLevel.INFO] - Initial log level
 * @returns {Logger} Logger instance
 */
export function createLogger(prefix: string, level: LogLevel = LogLevel.INFO): Logger {
  currentLogger = new Logger(level, prefix);
  
  // Expose to browser console for runtime control
  if (typeof window !== 'undefined') {
    (window as any).joplinLogger = {
      setLevel: (level: LogLevel) => {
        if (currentLogger) {
          currentLogger.setLevel(level);
          console.log(`[joplinLogger] Log level set to ${level} (${LogLevel[level]})`);
        }
      },
      getLevel: () => {
        if (currentLogger) {
          const level = currentLogger.getLevel();
          console.log(`[joplinLogger] Current log level: ${level} (${LogLevel[level]})`);
          return level;
        }
        return null;
      },
      LogLevel: LogLevel,
    };
  }
  
  return currentLogger;
}