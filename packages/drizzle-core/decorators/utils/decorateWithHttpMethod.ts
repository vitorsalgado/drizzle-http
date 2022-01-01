import { setupRequestFactory } from '../../ApiParameterization'
import { Metadata } from '../../ApiParameterization'
import { AnyClass, Decorator, isFunction, TargetProto } from '../../internal'
import { notNull } from '../../internal'

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
): (target: TargetProto, method: string, descriptor: PropertyDescriptor) => void {
  isFunction(decorator)
  notNull(httpMethod)
  notNull(path)

  return function (target: TargetProto, method: string, descriptor: PropertyDescriptor): void {
    Metadata.registerApiMethod(target.constructor, method)

    setupRequestFactory(decorator, target, method, requestFactory => {
      requestFactory.apiType = target.constructor as AnyClass
      requestFactory.method = method
      requestFactory.path = path.trim()
      requestFactory.httpMethod = httpMethod.toUpperCase()
      requestFactory.argLen = descriptor.value && typeof descriptor.value === 'function' ? descriptor.value.length : 0

      descriptor.value = (...args: unknown[]) => requestFactory.invoker()?.(...args)
    })
  }
}
