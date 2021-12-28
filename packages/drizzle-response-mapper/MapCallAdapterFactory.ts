import { CallAdapterFactory } from '@drizzle-http/core'
import { CallAdapter } from '@drizzle-http/core'
import { RequestFactory } from '@drizzle-http/core'
import { Drizzle } from '@drizzle-http/core'
import { MapFunctionKey } from './Keys'
import { MapToTypeKey } from './Keys'
import { MapToTypeMapperKey } from './Keys'
import { MapCallAdapter } from './MapCallAdapter'
import { MapToCallAdapter } from './MapToCallAdapter'
import { Map } from './decorators'
import { MapTo } from './decorators'

export class MapCallAdapterFactory implements CallAdapterFactory {
  provide(drizzle: Drizzle, requestFactory: RequestFactory): CallAdapter<unknown, unknown> | null {
    if (requestFactory.hasDecorator(Map)) {
      return new MapCallAdapter(requestFactory.getConfig(MapFunctionKey))
    } else if (requestFactory.hasDecorator(MapTo)) {
      return new MapToCallAdapter(requestFactory.getConfig(MapToTypeKey), requestFactory.getConfig(MapToTypeMapperKey))
    }

    return null
  }
}
