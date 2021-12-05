import { Drizzle } from './drizzle'
import { RequestFactory } from './request.factory'
import { RequestParameterization } from './request.parameterization'

/**
 * Converts a value to an HTTP representation format
 */
export interface RequestBodyConverter<T> {
  convert(requestFactory: RequestFactory, requestValues: RequestParameterization, value: T): void
}

/**
 * Creates instances of {@link RequestBodyConverter}
 */
export abstract class RequestConverterFactory {
  /**
   * This will be called outside the context of a request.
   * Every request will already contain a {@link RequestBodyConverter} instance ready.
   */
  abstract requestConverter(
    drizzle: Drizzle,
    method: string,
    requestFactory: RequestFactory
  ): RequestBodyConverter<unknown> | null
}
