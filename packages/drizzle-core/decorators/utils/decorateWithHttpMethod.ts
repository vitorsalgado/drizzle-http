import { DecoratedMethod, registerApiMethod, requestFactory } from '../../ApiParameterization.js'
import { AnyClass, Decorator, isFunction, TargetCtor } from '../../internal/index.js'
import { notNull } from '../../internal/index.js'
import { appendPendingMethodSetup, methodName, resolveOwner } from '../../decoratorMetadata.js'

/**
 * Configure a method to perform an HTTP request
 *
 * @param decorator - method decorator
 * @param httpMethod - HTTP verb of the request
 * @param path - request path that will be concatenated with the base url
 */
export function decorateWithHttpMethod(
  decorator: Decorator,
  httpMethod: string,
  path: string
): <T extends DecoratedMethod>(value: T, context: ClassMethodDecoratorContext) => T {
  isFunction(decorator)
  notNull(httpMethod)
  notNull(path)

  return function <T extends DecoratedMethod>(value: T, context: ClassMethodDecoratorContext): T {
    if (context.kind !== 'method') {
      throw new TypeError(`${String(decorator.name)} must be applied to a method.`)
    }

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

    if (context.static) {
      register()
    } else {
      appendPendingMethodSetup(context.metadata, register)
    }

    const wrapped = function (...args: unknown[]) {
      const apiCtor = registeredCtor ?? resolveOwner(context.metadata, context.static, value)
      const method = registeredMethod ?? methodName(context)
      const factory = requestFactory(apiCtor, method)

      return factory.invoker()?.(...args)
    }

    return wrapped as T
  }
}
