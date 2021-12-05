import { extractArgumentTypes, extractReturnType, InvalidRequestMethodConfigurationError } from '../../internal'
import { HttpMethod } from './HttpMethod'
import { RequestFactory } from '../../request.factory'
import DrizzleMeta from '../../drizzle.meta'

/**
 * Configure a method to perform a HTTP request
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

    DrizzleMeta.registerMethod(target.constructor, method)

    const requestFactory: RequestFactory = DrizzleMeta.provideRequestFactory(target.constructor, method)
    const argTypes = extractArgumentTypes(target.constructor.prototype, method)
    const returnType = extractReturnType(target.constructor.prototype, method)

    requestFactory.method = method
    requestFactory.path = path
    requestFactory.httpMethod = httpMethod
    requestFactory.argLen = descriptor.value.length
    requestFactory.returnType = returnType
    requestFactory.argTypes = argTypes

    const types = descriptor.value() || []

    if (types && types.length > 0) {
      if (!requestFactory.returnType) {
        requestFactory.returnType = types[0]
      }

      if (!requestFactory.returnGenericType) {
        requestFactory.returnGenericType = types[1]
      }
    }
  }
}