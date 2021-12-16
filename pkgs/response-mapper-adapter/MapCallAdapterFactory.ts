import { CallAdapterFactory } from '@drizzle-http/core'
import { CallAdapter } from '@drizzle-http/core'
import { RequestFactory } from '@drizzle-http/core'
import { Drizzle } from '@drizzle-http/core'
import { MapFunctionKey } from './Keys'
import { MapToTypeKey } from './Keys'
import { MapToTypeMapperKey } from './Keys'
import { MapCallAdapter } from './MapCallAdapter'
import { MapToCallAdapter } from './MapToCallAdapter'

export class MapCallAdapterFactory implements CallAdapterFactory {
  provide(drizzle: Drizzle, method: string, requestFactory: RequestFactory): CallAdapter<unknown, unknown> | null {
    if (requestFactory.hasConfig(MapFunctionKey)) {
      return new MapCallAdapter(requestFactory.getConfig(MapFunctionKey))
    } else if (requestFactory.hasConfig(MapToTypeKey)) {
      return new MapToCallAdapter(requestFactory.getConfig(MapToTypeKey), requestFactory.getConfig(MapToTypeMapperKey))
    }

    return null
  }
}
