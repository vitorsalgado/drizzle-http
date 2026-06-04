import { RequestFactory } from './RequestFactory.js'
import { HttpHeaders } from './HttpHeaders.js'
import { Decorator, isFunction, notBlank, notNull, TargetCtor } from './internal/index.js'
import { Drizzle } from './Drizzle.js'
import {
  appendPendingMethodSetup,
  flushPendingMethodSetups,
  methodName,
  resolveOwner,
  setOwner
} from './decoratorMetadata.js'

type Target = TargetCtor

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DecoratedMethod = (...args: any[]) => any

export class ApiDefaults {
  decorators: Decorator[] = []
  headers: HttpHeaders = new HttpHeaders({})
  readTimeout: number | undefined = undefined
  connectTimeout: number | undefined = undefined
  signal: unknown | null = null
  responseType: string = Drizzle.DEFAULT_RESPONSE_TYPE
  requestType: string = Drizzle.DEFAULT_REQUEST_TYPE
  errorType = ''
  bag: Map<string, unknown> = new Map()

  private _path = ''

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

  addConfig<T = unknown>(key: string, value: T): void {
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
  private static readonly ENTRIES: Map<TargetCtor, Data> = new Map()

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

  static registerApiMethod(target: TargetCtor, method: string): void {
    const data = Metadata.entries(target)

    if (!data.requestFactories.has(method)) {
      data.requestFactories.set(method, new RequestFactory())
    }
  }

  static has(api: TargetCtor): boolean {
    return Metadata.ENTRIES.has(api)
  }

  static metadataFor(api: TargetCtor): Data {
    const data = Metadata.ENTRIES.get(api)

    if (!data) {
      throw new TypeError(`Invalid API state. No metadata found for API definition: ${api}.`)
    }

    return data
  }

  private static entries(target: TargetCtor): Data {
    let data = Metadata.ENTRIES.get(target)

    if (!data) {
      data = {
        meta: new ApiDefaults(),
        requestFactories: new Map()
      }

      Metadata.ENTRIES.set(target, data)
    }

    return data
  }
}

export function setupApiDefaults(
  decorator: Decorator,
  target: Target,
  callback?: (parameters: ApiDefaults) => void
): void {
  const defaults = Metadata.apiDefaults(target)
  defaults.decorators.push(decorator)

  callback?.(defaults)
}

export function setupRequestFactory(
  decorator: Decorator,
  target: Target,
  method: string,
  callback?: (requestFactory: RequestFactory) => void
): void {
  const requestFactory = Metadata.requestFactory(target, method)
  requestFactory.registerDecorator(decorator)

  callback?.(requestFactory)
}

export interface DrizzleClassDecoratorContext {
  kind: 'class'
  target: TargetCtor
  defaults: ApiDefaults
}

export interface DrizzleMethodDecoratorContext {
  kind: 'method'
  target: TargetCtor
  method: string
  requestFactory: RequestFactory
}

export interface ClassAndMethodDecoratorContext {
  kind: 'class' | 'method'
  target: TargetCtor
  defaults: ApiDefaults
  requestFactory?: RequestFactory
  method?: string
}

export function createClassDecorator(
  decorator: Decorator,
  configurer?: (ctx: DrizzleClassDecoratorContext) => void
): (target: TargetCtor, context: ClassDecoratorContext) => void {
  isFunction(decorator)

  return function (target: TargetCtor, context: ClassDecoratorContext): void {
    if (context.kind !== 'class') {
      throw new TypeError(`${String(decorator.name)} must be applied to a class.`)
    }

    const ctor = target as TargetCtor
    setOwner(context.metadata, ctor)

    const defaults = Metadata.apiDefaults(ctor)
    defaults.decorators.push(decorator)

    configurer?.({
      kind: 'class',
      target: ctor,
      defaults
    })

    flushPendingMethodSetups(context.metadata)
  }
}

export function createMethodDecorator(
  decorator: Decorator,
  configurer?: (ctx: DrizzleMethodDecoratorContext) => void | DecoratedMethod
): <T extends DecoratedMethod>(methodValue: T, context: ClassMethodDecoratorContext) => T | void {
  isFunction(decorator)

  return function <T extends DecoratedMethod>(methodValue: T, context: ClassMethodDecoratorContext): T | void {
    if (context.kind !== 'method') {
      throw new TypeError(`${String(decorator.name)} must be applied to a method.`)
    }

    const register = () => {
      const apiCtor = resolveOwner(context.metadata, context.static, methodValue)
      const method = methodName(context)

      Metadata.registerApiMethod(apiCtor, method)

      const requestFactory = Metadata.requestFactory(apiCtor, method)
      requestFactory.registerDecorator(decorator)

      configurer?.({
        kind: 'method',
        target: apiCtor,
        method,
        requestFactory
      })
    }

    if (context.static) {
      register()
    } else {
      appendPendingMethodSetup(context.metadata, register)
    }

    return methodValue
  }
}

export function createClassAndMethodDecorator(
  decorator: Decorator,
  configurer: (ctx: ClassAndMethodDecoratorContext) => void
): <T extends TargetCtor | DecoratedMethod>(
  target: T,
  context: ClassDecoratorContext | ClassMethodDecoratorContext
) => void | T {
  isFunction(decorator)

  return function <T extends TargetCtor | DecoratedMethod>(
    target: T,
    context: ClassDecoratorContext | ClassMethodDecoratorContext
  ): void | T {
    if (context.kind === 'class') {
      const ctor = target as TargetCtor
      setOwner(context.metadata, ctor)

      const defaults = Metadata.apiDefaults(ctor)
      defaults.decorators.push(decorator)

      configurer({
        kind: 'class',
        target: ctor,
        defaults
      })

      flushPendingMethodSetups(context.metadata)

      return
    }

    if (context.kind === 'method') {
      const register = () => {
        const apiCtor = resolveOwner(context.metadata, context.static, target as DecoratedMethod)
        const method = methodName(context)
        const requestFactory = Metadata.requestFactory(apiCtor, method)

        requestFactory.registerDecorator(decorator)

        configurer({
          kind: 'method',
          target: apiCtor,
          method,
          defaults: Metadata.apiDefaults(apiCtor),
          requestFactory
        })
      }

      if (context.static) {
        register()
      } else {
        appendPendingMethodSetup(context.metadata, register)
      }

      return target
    }

    throw new TypeError(`${String(decorator.name)} must be applied to a class or method.`)
  }
}
