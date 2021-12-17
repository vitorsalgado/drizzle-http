/* eslint-disable @typescript-eslint/no-explicit-any */

import { createMethodDecorator } from '@drizzle-http/core'
import { MapFunctionKey } from '../Keys'

export function Map<R = any, TR = any>(mapper: (response: R) => TR) {
  return createMethodDecorator(Map, ctx => ctx.requestFactory.addConfig(MapFunctionKey, mapper))
}
