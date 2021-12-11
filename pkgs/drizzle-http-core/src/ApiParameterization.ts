import { RequestFactory } from './RequestFactory'
import { HttpHeaders } from './HttpHeaders'
import { notNull } from './internal'

type ApiConstructorType = Function
type TargetType = ApiConstructorType | object

export class ApiGlobalParameters {
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
  meta: ApiGlobalParameters
  requestFactories: Map<string, RequestFactory>
}

class ApiInternalParameterization {
  private readonly _entries: Map<ApiConstructorType, Data> = new Map()

  provideApiGlobalParameters(target: TargetType): ApiGlobalParameters {
    return this.getParametersDb(target).meta
  }

  provideRequestFactory(target: TargetType, method: string): RequestFactory {
    const data = this.getParametersDb(target)
    let requestFactory = data.requestFactories.get(method)

    if (!requestFactory) {
      requestFactory = new RequestFactory()
      data.requestFactories.set(method, requestFactory)
    }

    return requestFactory
  }

  registerApiMethod(target: ApiConstructorType, method: string): void {
    const data = this.getParametersDb(target)

    if (!data.requestFactories.has(method)) {
      data.requestFactories.set(method, new RequestFactory())
    }
  }

  parameterization(): Map<ApiConstructorType, Data> {
    return this._entries
  }

  parameterizationForTarget(api: ApiConstructorType): Data {
    const data = this._entries.get(api)

    if (!data) {
      throw new TypeError(`Invalid API state. No metadata found for API definition: ${api}.`)
    }

    return data
  }

  removeParameterizationFromTarget(target: ApiConstructorType): void {
    this._entries.delete(target)
  }

  private getParametersDb(target: TargetType): Data {
    const arg = typeof target === 'function' ? target : target.constructor

    let data = this._entries.get(arg)

    if (!data) {
      data = {
        meta: new ApiGlobalParameters(),
        requestFactories: new Map()
      }

      this._entries.set(arg, data)
    }

    return data
  }
}

const ApiParameterization = new ApiInternalParameterization()

export { ApiParameterization }

export function setupApiInstance(target: TargetType, callback: (parameters: ApiGlobalParameters) => void): void {
  callback(ApiParameterization.provideApiGlobalParameters(target))
}

export function setupApiMethod(
  target: TargetType,
  method: string,
  callback: (requestFactory: RequestFactory) => void
): void {
  callback(ApiParameterization.provideRequestFactory(target, method))
}

export function getRequestFactoryForMethod(target: TargetType, method: string): RequestFactory {
  return ApiParameterization.provideRequestFactory(target, method)
}
