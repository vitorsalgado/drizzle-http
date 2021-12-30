import { InvalidMethodConfigError } from '../../internal/index.ts'
import { setupRequestFactory } from '../../ApiParameterization.ts'
import { Metadata } from '../../ApiParameterization.ts'
import { HttpMethod } from './HttpMethod.ts'

/**
 * Configure a method to perform an HTTP request
 *
 * @param decorator - method decorator
 * @param httpMethod - HTTP verb of the request
 * @param path - request path that will be concatenated with the base url
 */
export function decorateWithHttpMethod(
  decorator: Function,
  httpMethod: HttpMethod,
  path = '/'
): (target: object, method: string, descriptor: PropertyDescriptor) => void {
  return function (target: object, method: string, descriptor: PropertyDescriptor): void {
    if (!path.startsWith('/')) {
      throw new InvalidMethodConfigError(method, 'Path must start with a /')
    }

    Metadata.registerApiMethod(target.constructor, method)

    setupRequestFactory(decorator, target, method, requestFactory => {
      requestFactory.apiType = target.constructor
      requestFactory.method = method
      requestFactory.path = path
      requestFactory.httpMethod = httpMethod
      requestFactory.argLen = descriptor.value.length

      descriptor.value = (...args: unknown[]) => requestFactory.invoker()?.(...args)
    })
  }
}
