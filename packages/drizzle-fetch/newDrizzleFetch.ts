import { DrizzleBuilder } from '@drizzle-http/core'
import { FetchCallFactory } from './FetchCallFactory'
import { PartParameterHandlerFactory } from './MultipartParameterHandler'
import { MultipartRequestBodyConverterFactory } from './MultipartRequestBodyConverter'

/**
 * Create a {@link DrizzleBuilder} instance with default configuration to use Fetch.
 */
export function newDrizzleFetch(): DrizzleBuilder {
  return DrizzleBuilder.newBuilder()
    .callFactory(FetchCallFactory.DEFAULT)
    .addParameterHandlerFactory(new PartParameterHandlerFactory())
    .addRequestConverterFactories(new MultipartRequestBodyConverterFactory())
}
