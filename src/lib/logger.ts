type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  action?: string;
  requestId?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const getCurrentLogLevel = (): LogLevel => {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
  if (envLevel && LOG_LEVELS[envLevel] !== undefined) {
    return envLevel;
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
};

const shouldLog = (level: LogLevel): boolean => {
  const currentLevel = getCurrentLogLevel();
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
};

const formatLogEntry = (entry: LogEntry): string => {
  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify(entry);
  }
  
  const { timestamp, level, message, context, error } = entry;
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  const errorStr = error ? ` Error: ${error.message}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}${errorStr}`;
};

const createLogEntry = (
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): LogEntry => ({
  timestamp: new Date().toISOString(),
  level,
  message,
  context,
  error: error ? {
    name: error.name,
    message: error.message,
    stack: error.stack,
  } : undefined,
});

const log = (level: LogLevel, message: string, context?: LogContext, error?: Error): void => {
  if (!shouldLog(level)) return;
  
  const entry = createLogEntry(level, message, context, error);
  const formattedEntry = formatLogEntry(entry);
  
  switch (level) {
    case 'debug':
    case 'info':
      console.log(formattedEntry);
      break;
    case 'warn':
      console.warn(formattedEntry);
      break;
    case 'error':
      console.error(formattedEntry);
      break;
  }
};

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext, error?: Error) => log('error', message, context, error),
  
  child: (baseContext: LogContext) => ({
    debug: (message: string, context?: LogContext) => 
      log('debug', message, { ...baseContext, ...context }),
    info: (message: string, context?: LogContext) => 
      log('info', message, { ...baseContext, ...context }),
    warn: (message: string, context?: LogContext) => 
      log('warn', message, { ...baseContext, ...context }),
    error: (message: string, context?: LogContext, error?: Error) => 
      log('error', message, { ...baseContext, ...context }, error),
  }),
};

export type Logger = typeof logger;
export type ChildLogger = ReturnType<typeof logger.child>;
