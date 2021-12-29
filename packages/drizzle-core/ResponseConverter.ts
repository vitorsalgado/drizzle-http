/**
 * Converts a value from its HTTP representation to another type
 */
import { Drizzle } from './Drizzle'
import { RequestFactory } from './RequestFactory'
import { HttpResponse } from './HttpResponse'

/**
 * Converts an {@link HttpResponse} to another object type.
 * Instances are created by {@link ResponseConverterFactory}.
 */
export interface ResponseConverter<T> {
  convert(from: HttpResponse): Promise<T>
}

/**
 * Creates instances of {@link ResponseConverter}
 * This will be called outside the context of a request.
 * Every request will already contain a {@link ResponseConverter} instance ready.
 */
export interface ResponseConverterFactory {
  /**
   * Provides an {@link ResponseConverter} instance.
   *
   * @param drizzle - {@link Drizzle} instance
   * @param responseType - response type. E.g.: json, text-plain
   * @param requestFactory - {@link RequestFactory} associated with an api method
   */
  provide(drizzle: Drizzle, responseType: string, requestFactory: RequestFactory): ResponseConverter<unknown> | null
}
