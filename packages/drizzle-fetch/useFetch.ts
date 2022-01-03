import { DrizzleBuilder } from '@drizzle-http/core'
import { PartParameterHandlerFactory } from './MultipartParameterHandler'
import { MultipartRequestBodyConverterFactory } from './MultipartRequestBodyConverter'
import { FetchCallFactory } from './FetchCallFactory'

export function useFetch() {
  return function (drizzleBuilder: DrizzleBuilder): void {
    drizzleBuilder.callFactory(new FetchCallFactory())
    drizzleBuilder.addParameterHandlerFactory(new PartParameterHandlerFactory())
    drizzleBuilder.addRequestConverterFactories(new MultipartRequestBodyConverterFactory())
  }
}
