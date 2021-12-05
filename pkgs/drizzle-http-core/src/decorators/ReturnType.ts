import { DrizzleMeta } from '../drizzle.meta'
import { ReturnType } from '../types'

/**
 * Set the request return types, including generic types.
 * It is an alternative to the helpers methods:
 * theTypes(…), nothing()
 * Target: method
 *
 * @param returnType - specify the return type
 * @param genericType - specify the generic return type, excluding interface types.
 *
 * @example
 * For a response of type Promise<Response>, where Response is a class type, specify the type as:
 *  \@ReturnTypes(Promise, Response)
 *  This will be used to detect the right converters and adapters for a request.
 */
export function ReturnTypes(returnType: ReturnType, genericType: ReturnType | null | undefined) {
  return function (target: object, method: string) {
    const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor, method)
    requestFactory.returnType = returnType
    requestFactory.returnGenericType = genericType
  }
}
