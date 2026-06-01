import { DrizzleBuilder } from '@drizzle-http/core'
import { PartParameterHandlerFactory } from './MultipartParameterHandler.js'
import { MultipartRequestBodyConverterFactory } from './MultipartRequestBodyConverter.js'
import { FetchCallFactory } from './FetchCallFactory.js'

export function useFetch() {
  return function (drizzleBuilder: DrizzleBuilder): void {
    drizzleBuilder.callFactory(new FetchCallFactory())
    drizzleBuilder.addParameterHandlerFactory(new PartParameterHandlerFactory())
    drizzleBuilder.addRequestConverterFactories(new MultipartRequestBodyConverterFactory())
  }
}
