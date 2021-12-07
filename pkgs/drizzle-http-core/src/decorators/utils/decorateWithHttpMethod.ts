import { InvalidRequestMethodConfigurationError } from '../../internal'
import { RequestFactory } from '../../RequestFactory'
import { DrizzleMeta } from '../../DrizzleMeta'
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
): (target: Object, method: string, descriptor: PropertyDescriptor) => void {
  return function (target: Object, method: string, descriptor: PropertyDescriptor): void {
    if (!path.startsWith('/')) {
      throw new InvalidRequestMethodConfigurationError(method, 'Path must start with a /')
    }

    DrizzleMeta.registerMethod(target.constructor.name, method)

    const requestFactory: RequestFactory = DrizzleMeta.provideRequestFactory(target.constructor.name, method)

    requestFactory.method = method
    requestFactory.path = path
    requestFactory.httpMethod = httpMethod
    requestFactory.argLen = descriptor.value.length
  }
}
