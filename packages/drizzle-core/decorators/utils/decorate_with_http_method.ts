import { DecoratedMethod, registerApiMethod, requestFactory } from '../../api_parameterization.js'
import { AnyClass, Decorator, isFunction, TargetCtor } from '../../internal/index.js'
import { notNull } from '../../internal/index.js'
import { methodName, resolveOwner } from '../../decorator_metadata.js'
import { fieldInitializerWrapper, resolveApiCtor, scheduleMemberSetup, wrapWithInvoker } from '../registrar/index.js'

/**
 * Configure a method or field to perform an HTTP request
 *
 * @param decorator - method decorator
 * @param httpMethod - HTTP verb of the request
 * @param path - request path that will be concatenated with the base url
 */
type HttpMethodDecorator = {
  <T extends DecoratedMethod>(value: T, context: ClassMethodDecoratorContext): T
  <T extends DecoratedMethod>(value: T | undefined, context: ClassFieldDecoratorContext): (initialValue: T) => T
}

export function decorateWithHttpMethod(decorator: Decorator, httpMethod: string, path: string): HttpMethodDecorator {
  isFunction(decorator)
  notNull(httpMethod)
  notNull(path)

  return function <T extends DecoratedMethod>(
    value: T | undefined,
    context: ClassMethodDecoratorContext | ClassFieldDecoratorContext
  ): T | ((initialValue: T) => T) {
    if (context.kind === 'method') {
      return decorateMethod(value as T, context)
    }

    if (context.kind === 'field') {
      return decorateField(context)
    }

    throw new TypeError(`${String(decorator.name)} must be applied to a method or field.`)
  }

  function decorateMethod<T extends DecoratedMethod>(value: T, context: ClassMethodDecoratorContext): T {
    let registeredCtor: TargetCtor | undefined
    let registeredMethod: string | undefined

    const register = () => {
      const apiCtor = resolveOwner(context.metadata, context.static, value)
      const method = methodName(context)

      registeredCtor = apiCtor
      registeredMethod = method

      registerApiMethod(apiCtor, method)

      const factory = requestFactory(apiCtor, method)
      factory.registerDecorator(decorator)
      factory.apiType = apiCtor as AnyClass
      factory.method = method
      factory.path = path.trim()
      factory.httpMethod = httpMethod.toUpperCase()
    }

    scheduleMemberSetup(context.metadata, context.static, register)

    const wrapped = function (...args: unknown[]) {
      const apiCtor = registeredCtor ?? resolveOwner(context.metadata, context.static, value)
      const method = registeredMethod ?? methodName(context)
      const factory = requestFactory(apiCtor, method)

      return factory.invoker()?.(...args)
    }

    return wrapped as T
  }

  function decorateField<T extends DecoratedMethod>(context: ClassFieldDecoratorContext): (initialValue: T) => T {
    const member = methodName(context)
    let registeredCtor: TargetCtor | undefined

    const register = () => {
      const apiCtor = resolveApiCtor(context.metadata, context.static, undefined, false)

      registeredCtor = apiCtor

      registerApiMethod(apiCtor, member)

      const factory = requestFactory(apiCtor, member)
      factory.registerDecorator(decorator)
      factory.apiType = apiCtor as AnyClass
      factory.method = member
      factory.path = path.trim()
      factory.httpMethod = httpMethod.toUpperCase()
    }

    scheduleMemberSetup(context.metadata, context.static, register)

    return fieldInitializerWrapper<T>(() =>
      wrapWithInvoker<T>(context.metadata, context.static, member, registeredCtor)
    )
  }
}
