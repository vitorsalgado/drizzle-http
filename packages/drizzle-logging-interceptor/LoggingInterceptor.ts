import { Chain, HttpError, HttpResponse, Interceptor } from '@drizzle-http/core'
import { Level } from './Level'
import { Logger } from './Logger'
import { PinoLogger } from './PinoLogger'
import { isStream } from './isStream'

interface Init {
  level?: Level
  headersToRedact?: Set<string>
  logger?: Logger
}

export class LoggingInterceptor implements Interceptor {
  static DEFAULT: LoggingInterceptor = new LoggingInterceptor()

  public level: Level
  private readonly headersToRedact: Set<string>
  public readonly logger: Logger

  constructor(init: Init = {}) {
    this.level = init.level ?? Level.BASIC
    this.headersToRedact = init.headersToRedact ?? new Set<string>()
    this.logger = init.logger ?? new PinoLogger(PinoLogger.DEFAULT_OPTIONS)
  }

  private static ms(): number {
    if (typeof process === 'undefined') {
      return Date.now()
    }

    const hrTime = process.hrtime()

    return (hrTime[0] * 1000000 + hrTime[1] / 1000) / 1000
  }

  setLevel(level: Level): void {
    this.level = level
  }

  redactHeader(...names: string[]): void {
    if (names.length === 0) {
      throw new TypeError('Parameter "names" must not be null or empty.')
    }

    names.forEach(name => {
      this.headersToRedact.add(name.toLowerCase())
    })
  }

  intercept(chain: Chain): Promise<HttpResponse> {
    const request = chain.request()
    const level = this.level

    if (level === Level.NONE) {
      return chain.proceed(request)
    }

    const logBody = level === Level.BODY
    const logHeaders = logBody || level === Level.HEADERS
    const contentType = request.headers.get('content-type')

    this.logger.info(`--> ${request.method} ${request.url}`)

    if (logHeaders) {
      if (request.body !== null) {
        if (contentType) {
          this.logger.info('Content-Type: ' + contentType)
        }

        if (request.headers.has('content-length')) {
          this.logger.info('Content-Length: ' + request.headers.get('content-length'))
        }
      }

      for (const [name, value] of request.headers) {
        this.logHeader(name, value)
      }
    }

    if (!logBody || request.body === null) {
      this.logger.info('--> END ' + request.method)
    } else if (isStream(request.body)) {
      this.logger.info('--> END ' + request.method + ' (stream request body omitted)')
    } else {
      if (Buffer.isBuffer(request.body)) {
        const isUtf8 = contentType && contentType.toLowerCase().indexOf('utf-8') > -1

        if (isUtf8) {
          this.logger.info((request.body as Buffer).toString('utf-8'))
          this.logger.info('--> END ' + request.method + ' (' + request.body.length + '-byte(s))')
        } else {
          this.logger.info('--> END ' + request.method + ' (' + request.body.length + '-byte body omitted)')
        }
      } else {
        this.logger.info(request.body.toString())
        this.logger.info('--> END ' + request.method)
      }
    }

    const start = LoggingInterceptor.ms()

    return chain
      .proceed(request)
      .then(response => {
        const took = LoggingInterceptor.ms() - start
        const bodySize = response.headers.has('content-length')
          ? response.headers.get('content-length')
          : 'unknown-length'

        this.logger.info(
          `<-- ${response.status}${response.statusText ? ' ' + response.statusText : ''} ${response.url}`
        )
        this.logger.info('Took: ' + took.toString() + 'ms')

        if (logHeaders) {
          for (const [name, value] of response.headers) {
            this.logHeader(name, value)
          }
        }

        this.logger.info('Body Size: ' + bodySize)

        if (!logBody || response.body === null) {
          this.logger.info('<-- END HTTP')
        } else if (isStream(response.body)) {
          this.logger.info('<-- END HTTP ' + request.method + ' (stream response body omitted)')
        } else {
          if (Buffer.isBuffer(response.body)) {
            const isUtf8 = contentType && contentType.toLowerCase().indexOf('utf-8') > -1

            if (isUtf8) {
              this.logger.info((response.body as Buffer).toString('utf-8'))
              this.logger.info('<-- END ' + request.method + ' (' + response.body.length + '-byte(s))')
            } else {
              this.logger.info('<-- END ' + request.method + ' (' + response.body.length + '-byte(s) body omitted)')
            }
          } else {
            this.logger.info(response.body.toString())
            this.logger.info('<-- END ' + request.method)
          }
        }

        this.logger.info('')

        return response
      })
      .catch(error => {
        const took = LoggingInterceptor.ms() - start

        if (error instanceof HttpError) {
          this.logger.error(
            `<-- ${error.response.status}${error.response.statusText ? ' ' + error.response.statusText : ''} ${
              error.request.url
            }`
          )

          if (logHeaders) {
            for (const [name, value] of error.response.headers) {
              this.logHeader(name, value, true)
            }
          }
        }

        this.logger.error('Took: ' + took.toString() + 'ms')
        this.logger.error('<-- HTTP Failed: ' + error.message, error)
        this.logger.error('')

        throw error
      })
  }

  private logHeader(name: string, value: string, isErr = false): void {
    if (this.headersToRedact.has(name)) {
      if (isErr) {
        this.logger.error(name + ': ' + '***')
      } else {
        this.logger.info(name + ': ' + '***')
      }
    } else {
      if (isErr) {
        this.logger.error(name + ': ' + value)
      } else {
        this.logger.info(name + ': ' + value)
      }
    }
  }
}
