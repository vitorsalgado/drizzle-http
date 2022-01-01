import { RequestFactory } from "./RequestFactory.ts";
import { RequestParameterization } from "./RequestParameterization.ts";
import { Drizzle } from "./Drizzle.ts";

/**
 * Converts a value to an HTTP representation format
 */
export interface RequestBodyConverter<T> {
  convert(
    requestFactory: RequestFactory,
    requestParameterization: RequestParameterization,
    value: T,
  ): void;
}

/**
 * Creates instances of {@link RequestBodyConverter}
 * This will be called outside the context of a request.
 * Every request will already contain a {@link RequestBodyConverter} instance ready.
 */
export interface RequestBodyConverterFactory {
  /**
   * Provides an {@link RequestBodyConverter} instance.
   *
   * @param drizzle - {@link Drizzle} instance
   * @param requestType - request type. E.g.: json, text-plain
   * @param requestFactory - {@link RequestFactory} associated with an api method
   */
  provide(
    drizzle: Drizzle,
    requestType: string,
    requestFactory: RequestFactory,
  ): RequestBodyConverter<unknown> | null;
}
