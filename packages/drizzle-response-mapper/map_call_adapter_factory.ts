import { CallAdapterFactory } from '@drizzle-http/core'
import { CallAdapter } from '@drizzle-http/core'
import { RequestFactory } from '@drizzle-http/core'
import { Drizzle } from '@drizzle-http/core'
import { MapFunctionKey } from './keys.js'
import { MapToTypeKey } from './keys.js'
import { MapToTypeMapperKey } from './keys.js'
import { MapCallAdapter } from './map_call_adapter.js'
import { MapToCallAdapter } from './map_to_call_adapter.js'
import { Map } from './decorators/index.js'
import { MapTo } from './decorators/index.js'

export class MapCallAdapterFactory implements CallAdapterFactory {
  constructor(private readonly decorated?: CallAdapterFactory) {}

  provide(drizzle: Drizzle, requestFactory: RequestFactory): CallAdapter<unknown, unknown> | null {
    if (requestFactory.hasDecorator(Map)) {
      return new MapCallAdapter(
        requestFactory.getConfig(MapFunctionKey),
        this.decorated?.provide(drizzle, requestFactory) as CallAdapter<unknown, Promise<unknown>>
      )
    } else if (requestFactory.hasDecorator(MapTo)) {
      return new MapToCallAdapter(
        requestFactory.getConfig(MapToTypeKey),
        requestFactory.getConfig(MapToTypeMapperKey),
        this.decorated?.provide(drizzle, requestFactory) as CallAdapter<unknown, Promise<unknown>>
      )
    }

    return null
  }
}
