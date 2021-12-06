import { HttpHeaders } from './HttpHeaders'
import { BodyType } from './internal'

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
