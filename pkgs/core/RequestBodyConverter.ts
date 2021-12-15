import { RequestFactory } from './RequestFactory'
import { RequestParameterization } from './RequestParameterization'
import { Drizzle } from './Drizzle'

/**
 * Converts a value to an HTTP representation format
 */
export interface RequestBodyConverter<T> {
  convert(requestFactory: RequestFactory, requestParameterization: RequestParameterization, value: T): void
}

/**
 * Creates instances of {@link RequestBodyConverter}
 */
export interface RequestBodyConverterFactory {
  /**
   * This will be called outside the context of a request.
   * Every request will already contain a {@link RequestBodyConverter} instance ready.
   */
  provide(drizzle: Drizzle, method: string, requestFactory: RequestFactory): RequestBodyConverter<unknown> | null
}
