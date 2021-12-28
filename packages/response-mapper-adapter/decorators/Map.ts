/* eslint-disable @typescript-eslint/no-explicit-any */

import { createMethodDecorator } from '@drizzle-http/core'
import { MapFunctionKey } from '../Keys'

export function Map<FROM = any, TO = any>(mapper: (response: FROM) => TO) {
  return createMethodDecorator(Map, ctx => ctx.requestFactory.addConfig(MapFunctionKey, mapper))
}
