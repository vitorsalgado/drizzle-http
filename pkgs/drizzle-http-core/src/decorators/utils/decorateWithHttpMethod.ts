import { InvalidMethodConfigError } from '../../internal'
import { RequestFactory } from '../../RequestFactory'
import { ApiParameterization } from '../../ApiParameterization'
import { HttpMethod } from './HttpMethod'

/**
 * Configure a method to perform an HTTP request
 *
 * @param httpMethod - HTTP verb of the request
 * @param path - request path that will be concatenated with the base url
 */
export function decorateWithHttpMethod(
  httpMethod: HttpMethod,
  path = '/'
): (target: object, method: string, descriptor: PropertyDescriptor) => void {
  return function (target: object, method: string, descriptor: PropertyDescriptor): void {
    if (!path.startsWith('/')) {
      throw new InvalidMethodConfigError(method, 'Path must start with a /')
    }

    ApiParameterization.registerApiMethod(target.constructor, method)

    const requestFactory: RequestFactory = ApiParameterization.provideRequestFactory(target, method)

    requestFactory.method = method
    requestFactory.path = path
    requestFactory.httpMethod = httpMethod
    requestFactory.argLen = descriptor.value.length
  }
}
