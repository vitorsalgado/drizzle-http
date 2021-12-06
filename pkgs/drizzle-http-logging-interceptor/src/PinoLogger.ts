import Pino from 'pino'
import { Logger } from './Logger'

export class PinoLogger implements Logger {
  static DEFAULT: PinoLogger = new PinoLogger({
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        messageFormat: '{msg}',
        translateTime: true,
        ignore: 'hostname'
      }
    }
  })

  private readonly pinoLogger: Pino.Logger

  constructor(options: Pino.LoggerOptions) {
    this.pinoLogger = Pino(options)
  }

  info(message: string): void {
    this.pinoLogger.info(message)
  }

  error(message: string, error?: Error): void {
    if (!error) {
      this.pinoLogger.error(message)
      return
    }

    this.pinoLogger.error(error, message)
  }
}
