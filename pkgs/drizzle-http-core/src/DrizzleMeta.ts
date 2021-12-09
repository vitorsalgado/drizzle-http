import { RequestFactory } from './RequestFactory'
import { HttpHeaders } from './HttpHeaders'
import { notNull } from './internal'

type ApiTarget = Function
type ExtractArgs = ApiTarget | object

export class ApiInstanceMeta {
  defaultHeaders: HttpHeaders
  readTimeout?: number
  connectTimeout?: number
  signal: unknown | null
  private path?: string

  constructor() {
    this.path = undefined
    this.defaultHeaders = new HttpHeaders({})
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
  private readonly _entries: Map<ApiTarget, Data> = new Map()

  provideInstanceMetadata(target: ExtractArgs): ApiInstanceMeta {
    return this.getOrInitMetadata(target).meta
  }

  provideRequestFactory(target: ExtractArgs, method: string): RequestFactory {
    const data = this.getOrInitMetadata(target)
    let requestFactory = data.requestFactories.get(method)

    if (!requestFactory) {
      requestFactory = new RequestFactory()
      data.requestFactories.set(method, requestFactory)
    }

    return requestFactory
  }

  registerMethod(target: ApiTarget, method: string): void {
    const data = this.getOrInitMetadata(target)

    if (!data.requestFactories.has(method)) {
      data.requestFactories.set(method, new RequestFactory())
    }
  }

  meta(): Map<ApiTarget, Data> {
    return this._entries
  }

  metaFor(api: ApiTarget): Data {
    const data = this._entries.get(api)

    if (!data) {
      throw new TypeError(`Invalid API state. No metadata found for API definition: ${api}.`)
    }

    return data
  }

  removeMetaFor(target: ApiTarget): void {
    this._entries.delete(target)
  }

  private getOrInitMetadata(target: ExtractArgs): Data {
    const arg = typeof target === 'function' ? target : target.constructor

    let data = this._entries.get(arg)

    if (!data) {
      data = {
        meta: new ApiInstanceMeta(),
        requestFactories: new Map()
      }

      this._entries.set(arg, data)
    }

    return data
  }
}

const DrizzleMeta = new _DrizzleMeta()

export { DrizzleMeta }
