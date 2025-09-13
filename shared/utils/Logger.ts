import fs from 'fs';


class Logger {
  private static instance: Logger;
  private logLevel: string;

  private constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'debug';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLogLevel(level: string): void {
    this.logLevel = level;
  }

  public getLogLevel(): string {
    return this.logLevel;
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private saveLog(message: string, ...args: any[]): void {
    const log = {
      timestamp: new Date().toISOString(),
      level: this.logLevel,
      message,
      args
    };
    fs.appendFileSync('server.log', JSON.stringify(log) + '\n');
  }

  public log(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(`[${new Date().toISOString()}] [DEBUG] ${message}`, ...args);
      this.saveLog('DEBUG', message, ...args);
    }
  }

  public error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`[${new Date().toISOString()}] [ERROR] ${message}`, ...args);
      this.saveLog('ERROR', message, ...args);
    }
  }

  public warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[${new Date().toISOString()}] [WARN] ${message}`, ...args);
      this.saveLog('WARN', message, ...args);
    }
  }

  public info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(`[${new Date().toISOString()}] [INFO] ${message}`, ...args);
      this.saveLog('INFO', message, ...args);
    }
  } 
}

export default Logger;