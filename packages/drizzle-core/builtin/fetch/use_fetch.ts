import { DrizzleBuilder } from '@drizzle-http/core'
import { PartParameterHandlerFactory } from './multipart_parameter_handler.js'
import { MultipartRequestBodyConverterFactory } from './multipart_request_body_converter.js'
import { FetchCallFactory } from './fetch_call_factory.js'

export function useFetch() {
  return function (drizzleBuilder: DrizzleBuilder): void {
    drizzleBuilder.callFactory(new FetchCallFactory())
    drizzleBuilder.addParameterHandlerFactory(new PartParameterHandlerFactory())
    drizzleBuilder.addRequestConverterFactories(new MultipartRequestBodyConverterFactory())
  }
}
