import { BodyType } from './types'
import { DzHeaders } from './http.headers'

export class RequestParameterization {
  constructor(
    public readonly argv: unknown[],
    public path: string = '',
    public readonly query: string[] = [],
    public readonly headers: DzHeaders = new DzHeaders({}),
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
