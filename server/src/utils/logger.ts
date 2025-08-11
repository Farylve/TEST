import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private logLevel: LogLevel;
  private logFile: string;

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
    this.logFile = process.env.LOG_FILE || path.join(logsDir, 'app.log');
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ') : '';
    
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${formattedArgs}`;
  }

  private writeToFile(message: string): void {
    try {
      fs.appendFileSync(this.logFile, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    
    return levels[level] >= levels[this.logLevel];
  }

  info(message: string, ...args: any[]): void {
    if (!this.shouldLog('info')) return;
    
    const formattedMessage = this.formatMessage('info', message, ...args);
    console.log('\x1b[36m%s\x1b[0m', formattedMessage); // Cyan
    
    if (process.env.NODE_ENV === 'production') {
      this.writeToFile(formattedMessage);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (!this.shouldLog('warn')) return;
    
    const formattedMessage = this.formatMessage('warn', message, ...args);
    console.warn('\x1b[33m%s\x1b[0m', formattedMessage); // Yellow
    
    if (process.env.NODE_ENV === 'production') {
      this.writeToFile(formattedMessage);
    }
  }

  error(message: string, ...args: any[]): void {
    if (!this.shouldLog('error')) return;
    
    const formattedMessage = this.formatMessage('error', message, ...args);
    console.error('\x1b[31m%s\x1b[0m', formattedMessage); // Red
    
    this.writeToFile(formattedMessage);
  }

  debug(message: string, ...args: any[]): void {
    if (!this.shouldLog('debug')) return;
    
    const formattedMessage = this.formatMessage('debug', message, ...args);
    console.debug('\x1b[35m%s\x1b[0m', formattedMessage); // Magenta
    
    if (process.env.NODE_ENV === 'development') {
      this.writeToFile(formattedMessage);
    }
  }
}

export const logger = new Logger();