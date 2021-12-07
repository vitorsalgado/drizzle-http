/**
 * Converts a value from its HTTP representation to another type
 */
import { Drizzle } from './Drizzle'
import { RequestFactory } from './RequestFactory'

export interface ResponseConverter<F, T> {
  convert(from: F): T
}

/**
 * Creates instances of {@link ResponseConverter}
 */
export interface ResponseConverterFactory {
  /**
   * This will be called outside the context of a request.
   * Every request will already contain a {@link ResponseConverter} instance ready.
   */
  responseBodyConverter(
    drizzle: Drizzle,
    method: string,
    requestFactory: RequestFactory
  ): ResponseConverter<unknown, unknown> | null
}
