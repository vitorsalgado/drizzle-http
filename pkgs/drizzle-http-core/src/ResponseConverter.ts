/**
 * Converts a value from its HTTP representation to another type
 */
import { Drizzle } from './Drizzle'
import { RequestFactory } from './RequestFactory'
import { HttpResponse } from './HttpResponse'

export interface ResponseConverter<T> {
  convert(from: HttpResponse): Promise<T>
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
  ): ResponseConverter<unknown> | null
}
