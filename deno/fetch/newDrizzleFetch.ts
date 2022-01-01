import { DrizzleBuilder } from "../DrizzleBuilder.ts";
import { DenoCallFactory } from "./DenoCallFactory.ts";
import { PartParameterHandlerFactory } from "./MultipartParameterHandler.ts";
import { MultipartRequestBodyConverterFactory } from "./MultipartRequestBodyConverter.ts";

/**
 * Create a {@link DrizzleBuilder} instance with default configuration to use Fetch.
 */
export function newDrizzleFetch() {
  return DrizzleBuilder.newBuilder()
    .callFactory(DenoCallFactory.DEFAULT)
    .addParameterHandlerFactory(new PartParameterHandlerFactory())
    .addRequestConverterFactories(new MultipartRequestBodyConverterFactory());
}
