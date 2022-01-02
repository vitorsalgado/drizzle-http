import { Chain, HttpError, Interceptor } from '@drizzle-http/core'
import { HttpResponse } from '@drizzle-http/core'
import { Level } from './Level'
import { isStream } from './isStream'

const Styles = {
  LightGray: 'color: gray; font-weight: lighter',
  Bold: 'font-weight: bold',
  Blue: 'color: #03A9F4',
  Green: 'color: #4CAF50',
  Red: 'color: #F20404'
}

interface Init {
  level?: Level
  headersToRedact?: Set<string>
}

export class BrowserLoggingInterceptor implements Interceptor {
  public level: Level
  private readonly headersToRedact: Set<string> = new Set<string>()

  constructor(init: Init = {}) {
    this.level = init.level ?? Level.BASIC
    this.headersToRedact = init.headersToRedact ?? new Set<string>()
  }

  private static ms(): number {
    return Date.now()
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

    console.groupCollapsed(`--> ${request.method} %c${request.url}`, ...[Styles.LightGray])

    if (logHeaders) {
      if (request.body !== null) {
        if (contentType) {
          console.log('Content-Type: ' + contentType)
        }

        if (request.headers.has('content-length')) {
          console.log('Content-Length: ' + request.headers.get('content-length'))
        }
      }

      for (const [name, value] of request.headers) {
        this.logHeader(name, value)
      }
    }

    if (!logBody || request.body === null) {
      console.log(`--> END ${request.method}`)
    } else if (isStream(request.body)) {
      console.log(`--> END ${request.method} %c(stream request body omitted)`, ...[Styles.LightGray])
    } else {
      if (Buffer.isBuffer(request.body)) {
        const isUtf8 =
          typeof contentType !== 'undefined' && contentType !== null && contentType.toLowerCase().indexOf('utf-8') > -1

        if (isUtf8) {
          console.log((request.body as Buffer).toString('utf-8'))
          console.log(`--> END ${request.method} %c(${request.body.length}-byte(s))`, ...[Styles.LightGray])
        } else {
          console.log(`--> END ${request.method} %c(${request.body.length}-byte body omitted)`, ...[Styles.LightGray])
        }
      } else {
        console.log(request.body.toString())
        console.log(`--> END ${request.method}`)
      }
    }

    console.groupEnd()

    const start = BrowserLoggingInterceptor.ms()

    return chain
      .proceed(request)
      .then(response => {
        const took = BrowserLoggingInterceptor.ms() - start
        const bodySize = response.headers.has('content-length')
          ? response.headers.get('content-length')
          : 'unknown-length'

        console.groupCollapsed(
          `<-- %c${response.status}${response.statusText ? ' ' + response.statusText : ''} ${response.url}`,
          ...[Styles.Green]
        )
        console.log(`Took: %c${took.toString()}ms`, ...[Styles.Green])

        if (logHeaders) {
          for (const [name, value] of response.headers.entries()) {
            this.logHeader(name, value)
          }
        }

        console.log('Body Size: ' + bodySize)

        if (!logBody || response.body === null) {
          console.log('<-- END HTTP')
        } else if (isStream(response.body)) {
          console.log(`<-- END HTTP ${request.method} %c(stream response body omitted)`, ...[Styles.LightGray])
        } else {
          if (Buffer.isBuffer(response.body)) {
            const isUtf8 =
              typeof contentType !== 'undefined' &&
              contentType !== null &&
              contentType.toLowerCase().indexOf('utf-8') > -1

            if (isUtf8) {
              console.log((response.body as Buffer).toString('utf-8'))
              console.log(`<-- END ${request.method} %c(${response.body.length}-byte(s))`, ...[Styles.LightGray])
            } else {
              console.log(
                `<-- END ${request.method} %c(${response.body.length}-byte(s) body omitted)`,
                ...[Styles.LightGray]
              )
            }
          } else {
            console.log(response.body)
            console.log(`<-- END ${request.method}`)
          }
        }

        return response
      })
      .catch(error => {
        const took = BrowserLoggingInterceptor.ms() - start

        if (error instanceof HttpError) {
          console.groupCollapsed(
            `<-- %c${error.response.status}${error.response.statusText ? ' ' + error.response.statusText : ''} ${
              error.request.url
            }`,
            ...[Styles.Red]
          )

          if (logHeaders) {
            for (const [name, value] of error.response.headers.entries()) {
              this.logHeader(name, value)
            }
          }
        } else {
          console.groupCollapsed(`<-- $c${request.method}`, ...[Styles.Red])
        }

        console.log('Took: ' + took.toString() + 'ms')
        console.log(`<-- HTTP Failed: %c${error.message}`, ...[Styles.Red])

        throw error
      })
      .finally(() => {
        console.groupEnd()
      })
  }

  private logHeader(name: string, value: string): void {
    if (this.headersToRedact.has(name)) {
      console.log(`${name}: ***`)
    } else {
      console.log(name + ': ' + value)
    }
  }
}
