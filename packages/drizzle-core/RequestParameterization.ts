import { HttpHeaders } from './HttpHeaders'
import { BodyType } from './BodyType'

/**
 * Holds HTTP request parameters to later build an actual HTTP request.
 * An instance of this class is created in each HTTP request and is passed through
 * {@link ParameterHandler} and {@link RequestBodyConverter} instances.
 */
export class RequestParameterization {
  constructor(
    public readonly argv: unknown[],
    public path: string = '',
    public readonly query: string[] = [],
    public readonly headers: HttpHeaders = new HttpHeaders({}),
    public readonly formFields: string[] = [],
    public body: BodyType = null,
    public signal: unknown | null = null
  ) {}

  buildPath(): string {
    return this.path + (this.query.length > 0 ? '?' + this.query.join('&') : '')
  }

  buildBody(): BodyType {
    if (this.body === null) {
      if (this.formFields.length > 0) {
        return this.formFields.join('&')
      }
      return null
    }

    return this.body
  }
}
