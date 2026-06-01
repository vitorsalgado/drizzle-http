import { pino, type Logger, type LoggerOptions } from 'pino'
import { Logger as DrizzleLogger } from './Logger.js'

export class PinoLogger implements DrizzleLogger {
  static DEFAULT_OPTIONS: LoggerOptions = {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      worker: { autoEnd: true },
      options: {
        colorize: true,
        messageFormat: '{msg}',
        translateTime: true,
        ignore: 'hostname'
      }
    }
  }

  private readonly pinoLogger: Logger

  constructor(options: LoggerOptions) {
    this.pinoLogger = pino(options)
  }

  info(message: string): void {
    this.pinoLogger.info(message)
  }

  error(message: string, _error?: Error): void {
    this.pinoLogger.error(message)
  }
}
