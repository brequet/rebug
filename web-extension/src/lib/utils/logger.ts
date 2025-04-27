export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    SILENT = 4,
}

// --- Configuration ---

// Determine the initial log level
// Default to INFO, but use DEBUG if in a development environment (adjust check as needed for WXT env vars)
// WXT sets process.env.NODE_ENV, but it might be 'production' even during development builds sometimes.
// Using import.meta.env.DEV is often more reliable in Vite-based environments like WXT.
const isDevelopment = import.meta.env.DEV;
const DEFAULT_LOG_LEVEL = isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;

let currentLogLevel: LogLevel = DEFAULT_LOG_LEVEL;

// Mapping levels to console methods
const consoleMethods: { [key in LogLevel]?: (...args: any[]) => void } = {
    [LogLevel.DEBUG]: console.info,
    [LogLevel.INFO]: console.info,
    [LogLevel.WARN]: console.warn,
    [LogLevel.ERROR]: console.error,
};

// --- Logger Class ---

class Logger {
    private readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    private log(level: LogLevel, message: any, ...optionalParams: any[]): void {
        if (level < currentLogLevel || level === LogLevel.SILENT) {
            return;
        }

        const method = consoleMethods[level] ?? console.log; // Fallback to console.log
        const timestamp = new Date().toISOString();
        const levelString = LogLevel[level].toUpperCase();

        // Format: [LEVEL] [YYYY-MM-DDTHH:mm:ss.sssZ] [LoggerName] Message ...optionalParams
        method(
            `[${levelString}] [${timestamp}] [${this.name}]`,
            message,
            ...optionalParams
        );
    }

    // --- Public Logging Methods ---

    /** Logs debug messages (most verbose) */
    debug(message: any, ...optionalParams: any[]): void {
        this.log(LogLevel.DEBUG, message, ...optionalParams);
    }

    /** Logs informational messages */
    info(message: any, ...optionalParams: any[]): void {
        this.log(LogLevel.INFO, message, ...optionalParams);
    }

    /** Logs warning messages */
    warn(message: any, ...optionalParams: any[]): void {
        this.log(LogLevel.WARN, message, ...optionalParams);
    }

    /** Logs error messages */
    error(message: any, ...optionalParams: any[]): void {
        this.log(LogLevel.ERROR, message, ...optionalParams);
    }
}

// --- Logger Management ---

// Optional: Cache logger instances to avoid recreating them
const loggerCache: { [name: string]: Logger } = {};

/**
 * Factory object to manage logging configuration and create logger instances.
 */
export const logger = {
    /**
     * Retrieves a logger instance for the given name.
     * @param name - A descriptive name for the logging context (e.g., 'MessageBus', 'BackgroundService').
     * @returns A Logger instance.
     */
    getLogger(name: string): Logger {
        if (!loggerCache[name]) {
            loggerCache[name] = new Logger(name);
        }
        return loggerCache[name];
    },

    /**
     * Sets the global minimum log level. Messages below this level will be ignored.
     * @param level - The minimum LogLevel to display.
     */
    setLevel(level: LogLevel): void {
        console.info(
            `[Logger] Global log level set to: ${LogLevel[level].toUpperCase()}`
        );
        currentLogLevel = level;
    },

    /**
     * Gets the current global minimum log level.
     * @returns The current LogLevel.
     */
    getLevel(): LogLevel {
        return currentLogLevel;
    },

    /**
     * Gets the string representation of the current global log level.
     * @returns The current log level as a string (e.g., "DEBUG").
     */
    getLevelName(): string {
        return LogLevel[currentLogLevel].toUpperCase();
    },
};

// Initial log message indicating the level being used
console.info(
    `[Logger] Initialized. Log level set to: ${logger.getLevelName()}`
);
