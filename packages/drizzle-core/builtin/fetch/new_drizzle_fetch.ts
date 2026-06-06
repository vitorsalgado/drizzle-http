import { DrizzleBuilder } from '@drizzle-http/core'
import { FetchCallFactory } from './fetch_call_factory.js'
import { PartParameterHandlerFactory } from './multipart_parameter_handler.js'
import { MultipartRequestBodyConverterFactory } from './multipart_request_body_converter.js'

/**
 * Create a {@link DrizzleBuilder} instance with default configuration to use Fetch.
 */
export function newDrizzleFetch(): DrizzleBuilder {
  return DrizzleBuilder.newBuilder()
    .callFactory(FetchCallFactory.DEFAULT)
    .addParameterHandlerFactory(new PartParameterHandlerFactory())
    .addRequestConverterFactories(new MultipartRequestBodyConverterFactory())
}
