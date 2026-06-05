import { RequestFactory } from './request_factory.js'
import { Decorator, isFunction, notBlank, notNull, TargetCtor } from './internal/index.js'
import { Drizzle } from './drizzle.js'
import { flushPendingMethodSetups, methodName, resolveOwner, setOwner } from './decorator_metadata.js'
import { resolveApiCtor, scheduleMemberSetup } from './decorators/registrar/index.js'

type Target = TargetCtor

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DecoratedMethod = (...args: any[]) => any

export class ApiDefaults {
  decorators: Decorator[] = []
  headers: Headers = new Headers()
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

export interface ApiMetadataEntry {
  meta: ApiDefaults
  requestFactories: Map<string, RequestFactory>
}

const apiMetadataEntries = new WeakMap<TargetCtor, ApiMetadataEntry>()

function getOrCreateApiMetadata(target: TargetCtor): ApiMetadataEntry {
  let data = apiMetadataEntries.get(target)

  if (!data) {
    data = {
      meta: new ApiDefaults(),
      requestFactories: new Map()
    }

    apiMetadataEntries.set(target, data)
  }

  return data
}

export function apiDefaults(target: TargetCtor): ApiDefaults {
  return getOrCreateApiMetadata(target).meta
}

export function requestFactory(target: TargetCtor, method: string): RequestFactory {
  const data = getOrCreateApiMetadata(target)
  let factory = data.requestFactories.get(method)

  if (!factory) {
    factory = new RequestFactory()
    data.requestFactories.set(method, factory)
  }

  return factory
}

export function registerApiMethod(target: TargetCtor, method: string): void {
  const data = getOrCreateApiMetadata(target)

  if (!data.requestFactories.has(method)) {
    data.requestFactories.set(method, new RequestFactory())
  }
}

export function metadataFor(api: TargetCtor): ApiMetadataEntry {
  const data = apiMetadataEntries.get(api)

  if (!data) {
    throw new TypeError(`Invalid API state. No metadata found for API definition: ${api}.`)
  }

  return data
}

export function setupApiDefaults(
  decorator: Decorator,
  target: Target,
  callback?: (parameters: ApiDefaults) => void
): void {
  const defaults = apiDefaults(target)
  defaults.decorators.push(decorator)

  callback?.(defaults)
}

export function setupRequestFactory(
  decorator: Decorator,
  target: Target,
  method: string,
  callback?: (requestFactory: RequestFactory) => void
): void {
  const factory = requestFactory(target, method)
  factory.registerDecorator(decorator)

  callback?.(factory)
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
  kind: 'class' | 'method' | 'field'
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

    const defaults = apiDefaults(ctor)
    defaults.decorators.push(decorator)

    configurer?.({
      kind: 'class',
      target: ctor,
      defaults
    })

    flushPendingMethodSetups(context.metadata)
  }
}

type MethodOrFieldDecorator = {
  <T extends DecoratedMethod>(methodValue: T, context: ClassMethodDecoratorContext): T
  (methodValue: undefined, context: ClassFieldDecoratorContext): void
}

export function createMethodDecorator(
  decorator: Decorator,
  configurer?: (ctx: DrizzleMethodDecoratorContext) => void | DecoratedMethod
): MethodOrFieldDecorator {
  isFunction(decorator)

  return function <T extends DecoratedMethod>(
    methodValue: T | undefined,
    context: ClassMethodDecoratorContext | ClassFieldDecoratorContext
  ): T | void {
    if (context.kind === 'field') {
      const register = () => {
        const apiCtor = resolveApiCtor(context.metadata, context.static, undefined, false)
        const method = methodName(context)

        registerApiMethod(apiCtor, method)

        const factory = requestFactory(apiCtor, method)
        factory.registerDecorator(decorator)

        configurer?.({
          kind: 'method',
          target: apiCtor,
          method,
          requestFactory: factory
        })
      }

      scheduleMemberSetup(context.metadata, context.static, register)

      return
    }

    if (context.kind !== 'method') {
      throw new TypeError(`${String(decorator.name)} must be applied to a method or field.`)
    }

    const register = () => {
      const apiCtor = resolveOwner(context.metadata, context.static, methodValue as T)
      const method = methodName(context)

      registerApiMethod(apiCtor, method)

      const factory = requestFactory(apiCtor, method)
      factory.registerDecorator(decorator)

      configurer?.({
        kind: 'method',
        target: apiCtor,
        method,
        requestFactory: factory
      })
    }

    scheduleMemberSetup(context.metadata, context.static, register)

    return methodValue as T
  }
}

type ClassMethodOrFieldDecorator = {
  (target: TargetCtor, context: ClassDecoratorContext): void
  <T extends DecoratedMethod>(target: T, context: ClassMethodDecoratorContext): T
  (target: undefined, context: ClassFieldDecoratorContext): void
}

export function createClassAndMethodDecorator(
  decorator: Decorator,
  configurer: (ctx: ClassAndMethodDecoratorContext) => void
): ClassMethodOrFieldDecorator {
  isFunction(decorator)

  return function <T extends TargetCtor | DecoratedMethod>(
    target: T | undefined,
    context: ClassDecoratorContext | ClassMethodDecoratorContext | ClassFieldDecoratorContext
  ): void | T {
    if (context.kind === 'class') {
      const ctor = target as TargetCtor
      setOwner(context.metadata, ctor)

      const defaults = apiDefaults(ctor)
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
        const factory = requestFactory(apiCtor, method)

        factory.registerDecorator(decorator)

        configurer({
          kind: 'method',
          target: apiCtor,
          method,
          defaults: apiDefaults(apiCtor),
          requestFactory: factory
        })
      }

      scheduleMemberSetup(context.metadata, context.static, register)

      return target as T
    }

    if (context.kind === 'field') {
      const register = () => {
        const apiCtor = resolveApiCtor(context.metadata, context.static, undefined, false)
        const method = methodName(context)
        const factory = requestFactory(apiCtor, method)

        factory.registerDecorator(decorator)

        configurer({
          kind: 'method',
          target: apiCtor,
          method,
          defaults: apiDefaults(apiCtor),
          requestFactory: factory
        })
      }

      scheduleMemberSetup(context.metadata, context.static, register)

      return
    }

    throw new TypeError(`${String(decorator.name)} must be applied to a class, method, or field.`)
  }
}
