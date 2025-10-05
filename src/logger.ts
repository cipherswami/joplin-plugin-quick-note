/*************************************************************
 * @file        logger.ts
 * @description Logger utility for Joplin plugins with dynamic
 *              log level control via browser console.
 * @author      Aravind Potluri <aravindswami135@gmail.com>
 * @license     MIT
 * 
 * @usage
 * // In your plugin:
 * import { createLogger, LogLevel } from './logger';
 * const logger = createLogger('[PluginName]', LogLevel.INFO);
 * logger.info('Message');
 * 
 * // In browser console:
 * joplinLogger.setLevel(0)   // Set to DEBUG
 * joplinLogger.getLevel()    // Get current level
 *************************************************************/

/**
 * Enumeration of available log levels.
 * Lower numeric values represent more verbose logging.
 * 
 * @enum {number}
 */
export enum LogLevel {
  /** Most verbose - all messages including debug information */
  DEBUG = 0,
  /** Informational messages about normal operations */
  INFO = 1,
  /** Warning messages about potential issues */
  WARN = 2,
  /** Error messages about failures */
  ERROR = 3,
  /** No logging output */
  NONE = 4,
}

/**
 * Logger class for plugin logging.
 * Handles formatted console output with configurable log levels.
 * 
 * @class
 */
export class Logger {
  /** Current log level threshold for this logger instance */
  private level: LogLevel;
  /** Plugin prefix used in log messages (e.g., '[PluginName]') */
  private prefix: string;

  /**
   * Creates a new Logger instance.
   * 
   * @param {LogLevel} level - Initial log level threshold
   * @param {string} prefix - Prefix to be used in log messages
   */
  constructor(level: LogLevel, prefix: string) {
    this.level = level;
    this.prefix = prefix;
  }

  /**
   * Updates the log level threshold for this logger.
   * Messages below this level will not be logged.
   * 
   * @param {LogLevel} level - New log level threshold
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Retrieves the current log level threshold.
   * 
   * @returns {LogLevel} Current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Logs a debug message if current level allows.
   * Use for detailed diagnostic information during development.
   */
  debug(...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(this.prefix, 'DEBUG : ', ...args);
    }
  }

  /**
   * Logs an informational message if current level allows.
   * Use for general information about plugin operations.
   */
  info(...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(this.prefix, 'INFO  : ', ...args);
    }
  }

  /**
   * Logs a warning message if current level allows.
   * Use for potentially problematic situations.
   */
  warn(...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.prefix, 'WARN  : ', ...args);
    }
  }

  /**
   * Logs an error message if current level allows.
   * Use for error conditions and exceptions.
   */
  error(...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.prefix, 'ERROR : ', ...args);
    }
  }
}

/**
 * Current logger instance for the plugin.
 * Allows access from console for runtime configuration.
 * 
 * @type {Logger | null}
 */
let currentLogger: Logger | null = null;

/**
 * Creates a logger instance for the plugin.
 * Automatically exposes control interface to browser console.
 * 
 * @param {string} prefix - Plugin identifier prefix (e.g., '[PluginName]')
 * @param {LogLevel} [level=LogLevel.INFO] - Initial log level
 * @returns {Logger} Logger instance for the plugin
 * 
 * @example
 * const logger = createLogger('[MyPlugin]', LogLevel.DEBUG);
 * logger.info('Plugin initialized');
 */
export function createLogger(prefix: string, level: LogLevel = LogLevel.INFO): Logger {
  currentLogger = new Logger(level, prefix);
  
  // Expose logger control to console
  if (typeof window !== 'undefined') {
    (window as any).joplinLogger = {
      /**
       * Sets the log level for the current plugin.
       * Changes take effect immediately without restart.
       * 
       * @param {LogLevel} level - Log level to apply
       * 
       * @example
       * joplinLogger.setLevel(0)  // Enable DEBUG
       * joplinLogger.setLevel(3)  // Show only ERRORs
       */
      setLevel: (level: LogLevel) => {
        if (currentLogger) {
          currentLogger.setLevel(level);
          console.log(`[joplinLogger] Log level set to ${level} (${LogLevel[level]})`);
        }
      },

      /**
       * Gets the current log level.
       * 
       * @returns {LogLevel} Current log level
       * 
       * @example
       * joplinLogger.getLevel()  // Returns current level
       */
      getLevel: () => {
        if (currentLogger) {
          const level = currentLogger.getLevel();
          console.log(`[joplinLogger] Current log level: ${level} (${LogLevel[level]})`);
          return level;
        }
        return null;
      },

      /**
       * Reference to LogLevel enum for console usage.
       * 
       * @example
       * joplinLogger.setLevel(PluginLogger.LogLevel.DEBUG)
       */
      LogLevel: LogLevel,
    };
  }
  
  return currentLogger;
}