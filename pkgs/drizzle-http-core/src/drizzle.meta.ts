import 'reflect-metadata'

import { RequestFactory } from './request.factory'
import { Check } from './internal'
import { Headers } from './http.headers'

const KeyApiInstanceMeta = 'drizzle:i'
const KeyRequestFactory = 'drizzle:ri'
const KeyRegisteredMethods = 'drizzle:m'

export class ApiInstanceMeta {
  private path?: string
  defaultHeaders: Headers
  readTimeout?: number
  connectTimeout?: number
  signal: any | null

  constructor() {
    this.path = undefined
    this.defaultHeaders = new Headers({})
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
    Check.nullOrUndefined(value, 'Parameter "value" cannot be null.')

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

export const DrizzleMeta = {
  /**
   * Get or create a {@link ApiInstanceMeta} instance associated with a API class and method
   *
   * @param target - api target where {@link ApiInstanceMeta} is stored
   */
  provideInstanceMetadata: (target: any): ApiInstanceMeta => {
    let instanceMeta = Reflect.getMetadata(KeyApiInstanceMeta, target)

    if (instanceMeta !== null && typeof instanceMeta !== 'undefined') {
      return instanceMeta
    }

    instanceMeta = new ApiInstanceMeta()

    storeApiInstanceMeta(instanceMeta, target)

    return instanceMeta
  },

  /**
   * Get or create a {@link RequestFactory} instance associated with a API class and method
   */
  provideRequestFactory: (target: any, method: string): RequestFactory => {
    let requestFactory = Reflect.getMetadata(KeyRequestFactory, target, method)

    if (requestFactory !== null && typeof requestFactory !== 'undefined') {
      return requestFactory
    }

    requestFactory = new RequestFactory()

    storeRequestFactory(requestFactory, target, method)

    return requestFactory
  },

  registeredMethods: (target: any): Set<string> => {
    return Reflect.getMetadata(KeyRegisteredMethods, target) || new Set<string>()
  },

  /**
   * Registers a method that performs HTTP calls
   */
  registerMethod: (target: any, method: string): void => {
    const register = DrizzleMeta.registeredMethods(target)
    register.add(method)
    Reflect.defineMetadata(KeyRegisteredMethods, register, target)
  }
}

export default DrizzleMeta

/**
 * Get or create a method register for a API class
 */
function storeApiInstanceMeta(am: ApiInstanceMeta, target: any): void {
  Reflect.defineMetadata(KeyApiInstanceMeta, am, target)
}

/**
 * Stores the requestFactory associated with a API class and method
 */
function storeRequestFactory(rf: RequestFactory, target: any, method: string | symbol): void {
  Reflect.defineMetadata(KeyRequestFactory, rf, target, method)
}
