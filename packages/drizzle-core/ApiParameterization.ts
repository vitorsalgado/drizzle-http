import { RequestFactory } from './RequestFactory'
import { HttpHeaders } from './HttpHeaders'
import { notNull } from './internal'
import { isFunction } from './internal'
import { TargetClass } from './internal'
import { notBlank } from './internal'
import { Drizzle } from './Drizzle'

type CtorTarget = Function
type Target = CtorTarget | object

export class ApiDefaults {
  decorators: Function[] = []
  headers: HttpHeaders = new HttpHeaders({})
  readTimeout: number | undefined = undefined
  connectTimeout: number | undefined = undefined
  signal: unknown | null = null
  responseType: string = Drizzle.DEFAULT_RESPONSE_TYPE
  requestType: string = Drizzle.DEFAULT_REQUEST_TYPE
  errorType: string = ''
  bag: Map<string, unknown> = new Map()

  private _path: string = ''

  get path(): string {
    return this._path
  }

  set path(value: string) {
    notNull(value, 'Parameter "value" cannot be null.')

    if (!value.startsWith('/')) {
      value = '/' + value
    }

    if (value.endsWith('/')) {
      value = value.substring(0, value.length - 1)
    }

    this._path = value
  }

  addConfig(key: string, value: unknown): void {
    notBlank(key, 'Parameters "key" cannot be null or empty.')
    notNull(value, 'Parameters "value" cannot be null.')

    this.bag.set(key, value)
  }

  getConfig<R>(key: string): R {
    notBlank(key, 'Parameter "key" cannot be null or empty.')

    return this.bag.get(key) as R
  }

  hasConfig(key: string): boolean {
    return this.bag.has(key)
  }
}

interface Data {
  meta: ApiDefaults
  requestFactories: Map<string, RequestFactory>
}

export class Metadata {
  private static readonly ENTRIES: Map<CtorTarget, Data> = new Map()

  static apiDefaults(target: Target): ApiDefaults {
    return Metadata.entries(target).meta
  }

  static requestFactory(target: Target, method: string): RequestFactory {
    const data = Metadata.entries(target)
    let requestFactory = data.requestFactories.get(method)

    if (!requestFactory) {
      requestFactory = new RequestFactory()
      data.requestFactories.set(method, requestFactory)
    }

    return requestFactory
  }

  static registerApiMethod(target: CtorTarget, method: string): void {
    const data = Metadata.entries(target)

    if (!data.requestFactories.has(method)) {
      data.requestFactories.set(method, new RequestFactory())
    }
  }

  static metadataFor(api: CtorTarget): Data {
    const data = Metadata.ENTRIES.get(api)

    if (!data) {
      throw new TypeError(`Invalid API state. No metadata found for API definition: ${api}.`)
    }

    return data
  }

  private static entries(target: Target): Data {
    const arg = typeof target === 'function' ? target : target.constructor

    let data = Metadata.ENTRIES.get(arg)

    if (!data) {
      data = {
        meta: new ApiDefaults(),
        requestFactories: new Map()
      }

      Metadata.ENTRIES.set(arg, data)
    }

    return data
  }
}

export function setupApiDefaults(
  decorator: Function,
  target: Target,
  callback?: (parameters: ApiDefaults) => void
): void {
  const defaults = Metadata.apiDefaults(target)
  defaults.decorators.push(decorator)

  callback?.(defaults)
}

export function setupRequestFactory(
  decorator: Function,
  target: Target,
  method: string,
  callback?: (requestFactory: RequestFactory) => void
): void {
  const requestFactory = Metadata.requestFactory(target, method)
  requestFactory.registerDecorator(decorator)

  callback?.(requestFactory)
}

interface ClassDecoratorContext {
  target: Function
  defaults: ApiDefaults
}

export function createClassDecorator(decorator: Function, configurer?: (ctx: ClassDecoratorContext) => void) {
  isFunction(decorator)

  return function (target: Function) {
    const defaults = Metadata.apiDefaults(target)
    defaults.decorators.push(decorator)

    configurer?.({
      target,
      defaults
    })
  }
}

interface MethodDecoratorContext<T = unknown> {
  target: object
  method: string
  descriptor: PropertyDescriptor
  requestFactory: RequestFactory
}

export function createMethodDecorator<T = any>(
  decorator: Function,
  configurer?: (ctx: MethodDecoratorContext<T>) => void
) {
  isFunction(decorator)

  return function (target: object, method: string, descriptor: PropertyDescriptor): void {
    const requestFactory = Metadata.requestFactory(target, method)
    requestFactory.registerDecorator(decorator)

    configurer?.({
      target,
      method,
      descriptor,
      requestFactory
    })
  }
}

export function createClassAndMethodDecorator<T = any>(
  decorator: Function,
  onClass?: (defaults: ApiDefaults) => void,
  onMethod?: (requestFactory: RequestFactory) => void
) {
  isFunction(decorator)

  return function (target: object | TargetClass, method?: string) {
    if (method) {
      const requestFactory = Metadata.requestFactory(target, method)
      requestFactory.registerDecorator(decorator)

      onMethod?.(requestFactory)
    } else {
      const defaults = Metadata.apiDefaults(target)
      defaults.decorators.push(decorator)

      onClass?.(defaults)
    }
  }
}

interface ParameterDecoratorContext {
  target: object
  method: string
  parameterIndex: number
  requestFactory: RequestFactory
}

export function createParameterDecorator(decorator: Function, configurer?: (ctx: ParameterDecoratorContext) => void) {
  isFunction(decorator)

  return function (target: object, method: string, parameterIndex: number) {
    const requestFactory = Metadata.requestFactory(target, method)
    requestFactory.registerDecorator(decorator)

    configurer?.({
      target,
      method,
      parameterIndex,
      requestFactory
    })
  }
}
