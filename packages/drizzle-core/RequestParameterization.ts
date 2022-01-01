import { HttpHeaders } from './HttpHeaders'
import { BodyType } from './BodyType'
import { MediaTypes } from './MediaTypes'

/**
 * Holds HTTP request parameters to later build an actual HTTP request.
 * An instance of this class is created in each HTTP request and is passed through
 * {@link ParameterHandler} and {@link RequestBodyConverter} instances.
 */
export class RequestParameterization {
  public path = ''
  public readonly query: string[]
  public readonly headers: HttpHeaders
  public readonly formFields: URLSearchParams
  public body: unknown
  public signal: unknown | null

  constructor(
    public readonly argv: unknown[],
    path = '',
    query: string[] = [],
    headers: HttpHeaders = new HttpHeaders({}),
    formFields: URLSearchParams = new URLSearchParams(),
    body: BodyType = null,
    signal: unknown | null = null
  ) {
    this.path = path
    this.query = query
    this.headers = new HttpHeaders(headers.toObject())
    this.formFields = formFields
    this.body = body
    this.signal = signal
  }

  public static newRequest(argv: unknown[], path: string, headers: HttpHeaders, signal: unknown | null) {
    return new RequestParameterization(argv, path, [], headers, new URLSearchParams(), null, signal)
  }

  buildPath(): string {
    return this.path + (this.query.length > 0 ? '?' + this.query.join('&') : '')
  }

  buildBody(): unknown {
    if (this.body === null) {
      if (this.headers.get('content-type')?.includes(MediaTypes.APPLICATION_FORM_URL_ENCODED)) {
        return this.formFields.toString()
      }
      return null
    }

    return this.body
  }
}
