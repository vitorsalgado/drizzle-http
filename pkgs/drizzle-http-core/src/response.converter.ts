import { Drizzle } from './drizzle'
import { RequestFactory } from './request.factory'

/**
 * Converts a value from its HTTP representation to another handledType
 */
export interface ResponseConverter<F, T> {
  convert(from: F): T
}

/**
 * Creates instances of {@link ResponseConverter}
 */
export abstract class ResponseConverterFactory {
  /**
   * This will be called outside the context of a request.
   * Every request will already contain a {@link ResponseConverter} instance ready.
   */
  abstract responseBodyConverter(
    drizzle: Drizzle,
    method: string,
    requestFactory: RequestFactory
  ): ResponseConverter<unknown, unknown> | null
}
