import { DrizzleBuilder } from '../DrizzleBuilder.ts'
import { DenoFetchCallFactory } from './DenoFetchCallFactory.ts'
import { PartParameterHandlerFactory } from './MultipartParameterHandler.ts'
import { MultipartRequestBodyConverterFactory } from './MultipartRequestBodyConverter.ts'

/**
 * Create a {@link DrizzleBuilder} instance with default configuration to use Fetch.
 */
export function newDrizzleFetch(): DrizzleBuilder {
  return DrizzleBuilder.newBuilder()
    .callFactory(DenoFetchCallFactory.DEFAULT)
    .addParameterHandlerFactory(new PartParameterHandlerFactory())
    .addRequestConverterFactories(new MultipartRequestBodyConverterFactory())
}
