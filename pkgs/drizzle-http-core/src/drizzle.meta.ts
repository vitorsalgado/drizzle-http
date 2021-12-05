import { RequestFactory } from './request.factory'
import { DzHeaders } from './http.headers'
import { notNull } from './internal'

export class ApiInstanceMeta {
  defaultHeaders: DzHeaders
  readTimeout?: number
  connectTimeout?: number
  signal: unknown | null
  private path?: string

  constructor() {
    this.path = undefined
    this.defaultHeaders = new DzHeaders({})
    this.connectTimeout = undefined
    this.readTimeout = undefined
    this.signal = null
  }

  /**
   * Utility to add default params
   * Use it in decorators
   *
   * @param value - params object
   */
  addDefaultHeaders(value: Record<string, string>): void {
    this.defaultHeaders.mergeObject(value)
  }

  setPath(value: string): void {
    notNull(value, 'Parameter "value" cannot be null.')

    if (!value.startsWith('/')) {
      value = '/' + value
    }

    if (value.endsWith('/')) {
      value = value.substring(0, value.length - 1)
    }

    this.path = value
  }

  getPath(): string | undefined {
    return this.path
  }
}

interface Data {
  meta: ApiInstanceMeta
  requestFactories: Map<string, RequestFactory>
}

class _DrizzleMeta {
  private readonly _meta: Map<string, Data> = new Map<string, Data>()

  provideInstanceMetadata(target: string): ApiInstanceMeta {
    return this.getOrInitMetadata(target).meta
  }

  provideRequestFactory(target: string, method: string): RequestFactory {
    const data = this.getOrInitMetadata(target)
    let requestFactory = data.requestFactories.get(method)

    if (!requestFactory) {
      requestFactory = new RequestFactory()
      data.requestFactories.set(method, requestFactory)
    }

    return requestFactory
  }

  registerMethod(target: string, method: string): void {
    const data = this.getOrInitMetadata(target)

    if (!data.requestFactories.has(method)) {
      data.requestFactories.set(method, new RequestFactory())
    }
  }

  meta(): Map<string, Data> {
    return this._meta
  }

  metaFor(api: string): Data {
    const data = this._meta.get(api)

    if (!data) {
      throw new TypeError(`Invalid API state. No metadata found for API definition: ${api}.`)
    }

    return data
  }

  removeMetaFor(api: string): void {
    this._meta.delete(api)
  }

  private getOrInitMetadata(name: string): Data {
    let data = this._meta.get(name)

    if (!data) {
      data = {
        meta: new ApiInstanceMeta(),
        requestFactories: new Map()
      }

      this._meta.set(name, data)
    }

    return data
  }
}

const DrizzleMeta = new _DrizzleMeta()

export default DrizzleMeta
export { DrizzleMeta }
