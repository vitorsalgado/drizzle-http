import { InvalidMethodConfigError } from '../../internal'
import { setupMethodOrParameterDecorator } from '../../ApiParameterization'
import { registerApiMethod } from '../../ApiParameterization'
import { HttpMethod } from './HttpMethod'

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

    registerApiMethod(target.constructor, method)

    setupMethodOrParameterDecorator(decorator, target, method, requestFactory => {
      requestFactory.method = method
      requestFactory.path = path
      requestFactory.httpMethod = httpMethod
      requestFactory.argLen = descriptor.value.length
    })
  }
}
