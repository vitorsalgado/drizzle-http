import { RequestFactory } from './RequestFactory'
import { HttpHeaders } from './HttpHeaders'
import { notNull } from './internal'
import { isFunction } from './internal'

type ConstructorTargetType = Function
type TargetType = ConstructorTargetType | object

export class ApiDefaults {
  private _path: string = ''

  decorators: Function[] = []
  headers: HttpHeaders = new HttpHeaders({})
  readTimeout: number | undefined = undefined
  connectTimeout: number | undefined = undefined
  signal: unknown | null = null
  bag: Map<string, unknown> = new Map()

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
}

interface Data {
  meta: ApiDefaults
  requestFactories: Map<string, RequestFactory>
}

class ApiMethodParameterization {
  private readonly _entries: Map<ConstructorTargetType, Data> = new Map()

  provideApiDefaults(target: TargetType): ApiDefaults {
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

  registerApiMethod(target: ConstructorTargetType, method: string): void {
    const data = this.getParametersDb(target)

    if (!data.requestFactories.has(method)) {
      data.requestFactories.set(method, new RequestFactory())
    }
  }

  parameterizationForTarget(api: ConstructorTargetType): Data {
    const data = this._entries.get(api)

    if (!data) {
      throw new TypeError(`Invalid API state. No metadata found for API definition: ${api}.`)
    }

    return data
  }

  private getParametersDb(target: TargetType): Data {
    const arg = typeof target === 'function' ? target : target.constructor

    let data = this._entries.get(arg)

    if (!data) {
      data = {
        meta: new ApiDefaults(),
        requestFactories: new Map()
      }

      this._entries.set(arg, data)
    }

    return data
  }
}

const ApiParameterization = new ApiMethodParameterization()

export function registerApiMethod(target: ConstructorTargetType, method: string): void {
  return ApiParameterization.registerApiMethod(target, method)
}

export function parameterizationForTarget(target: ConstructorTargetType): Data {
  return ApiParameterization.parameterizationForTarget(target)
}

export function setupClassDecorator(
  decorator: Function,
  target: TargetType,
  callback?: (parameters: ApiDefaults) => void
): void {
  const defaults = ApiParameterization.provideApiDefaults(target)
  defaults.decorators.push(decorator)

  callback?.(defaults)
}

export function setupMethodOrParameterDecorator(
  decorator: Function,
  target: TargetType,
  method: string,
  callback?: (requestFactory: RequestFactory) => void
): void {
  const requestFactory = ApiParameterization.provideRequestFactory(target, method)
  requestFactory.registerDecorator(decorator)

  callback?.(requestFactory)
}

export function getRequestFactoryForMethod(target: TargetType, method: string): RequestFactory {
  return ApiParameterization.provideRequestFactory(target, method)
}

export interface ClassDecoratorContext {
  target: Function
  defaults: ApiDefaults
}

export function createClassDecorator(decorator: Function, configurer?: (ctx: ClassDecoratorContext) => void) {
  isFunction(decorator)

  return function (target: Function) {
    const defaults = ApiParameterization.provideApiDefaults(target)
    defaults.decorators.push(decorator)

    configurer?.({
      target,
      defaults
    })
  }
}

export interface MethodDecoratorContext<T = unknown> {
  target: object
  method: string
  descriptor: TypedPropertyDescriptor<T>
  requestFactory: RequestFactory
}

export function createMethodDecorator<T = any>(
  decorator: Function,
  configurer?: (ctx: MethodDecoratorContext<T>) => void
) {
  isFunction(decorator)

  return function (target: object, method: string, descriptor: TypedPropertyDescriptor<T>): void {
    const requestFactory = ApiParameterization.provideRequestFactory(target, method)
    requestFactory.registerDecorator(decorator)

    configurer?.({
      target,
      method,
      descriptor,
      requestFactory
    })
  }
}

export interface ParameterDecoratorContext {
  target: object
  method: string
  parameterIndex: number
  requestFactory: RequestFactory
}

export function createParameterDecorator(decorator: Function, configurer?: (ctx: ParameterDecoratorContext) => void) {
  isFunction(decorator)

  return function (target: object, method: string, parameterIndex: number) {
    const requestFactory = ApiParameterization.provideRequestFactory(target, method)
    requestFactory.registerDecorator(decorator)

    configurer?.({
      target,
      method,
      parameterIndex,
      requestFactory
    })
  }
}

export interface PropertyDecoratorContext {
  target: object | Function
  property: string
}
