import 'reflect-metadata'

import { RequestFactory } from './request.factory'
import { Check } from './internal'
import { DzHeaders } from './http.headers'

const KeyApiInstanceMeta = 'drizzle:i'
const KeyRequestFactory = 'drizzle:ri'
const KeyRegisteredMethods = 'drizzle:m'

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
   * Get or create a {@link ApiInstanceMeta} instance associated with an API class and method
   *
   * @param target - api target where {@link ApiInstanceMeta} is stored
   */
  provideInstanceMetadata: (target: object): ApiInstanceMeta => {
    let instanceMeta = Reflect.getMetadata(KeyApiInstanceMeta, target)

    if (instanceMeta !== null && typeof instanceMeta !== 'undefined') {
      return instanceMeta
    }

    instanceMeta = new ApiInstanceMeta()

    storeApiInstanceMeta(instanceMeta, target)

    return instanceMeta
  },

  /**
   * Get or create a {@link RequestFactory} instance associated with an API class and method
   */
  provideRequestFactory: (target: object, method: string): RequestFactory => {
    let requestFactory = Reflect.getMetadata(KeyRequestFactory, target, method)

    if (requestFactory !== null && typeof requestFactory !== 'undefined') {
      return requestFactory
    }

    requestFactory = new RequestFactory()

    storeRequestFactory(requestFactory, target, method)

    return requestFactory
  },

  registeredMethods: (target: object): Set<string> => {
    return Reflect.getMetadata(KeyRegisteredMethods, target) || new Set<string>()
  },

  /**
   * Registers a method that performs HTTP calls
   */
  registerMethod: (target: object, method: string): void => {
    const register = DrizzleMeta.registeredMethods(target)
    register.add(method)
    Reflect.defineMetadata(KeyRegisteredMethods, register, target)
  }
}

export default DrizzleMeta

/**
 * Get or create a method register for an API class
 */
function storeApiInstanceMeta(am: ApiInstanceMeta, target: object): void {
  Reflect.defineMetadata(KeyApiInstanceMeta, am, target)
}

/**
 * Stores the requestFactory associated with an API class and method
 */
function storeRequestFactory(rf: RequestFactory, target: object, method: string | symbol): void {
  Reflect.defineMetadata(KeyRequestFactory, rf, target, method)
}
