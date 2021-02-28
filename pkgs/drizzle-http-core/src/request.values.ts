import { BodyType } from './types'
import { Headers } from './http.headers'

export class RequestValues {
  constructor(
    public readonly argv: any[],
    public path: string = '',
    public readonly query: string[] = [],
    public readonly headers: Headers = new Headers({}),
    public readonly formFields: string[] = [],
    public body: BodyType = null,
    public signal: any | null = null
  ) {
  }

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
