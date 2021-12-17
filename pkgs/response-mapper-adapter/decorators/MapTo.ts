/* eslint-disable @typescript-eslint/no-explicit-any */

import { Internals } from '@drizzle-http/core'
import { createMethodDecorator } from '@drizzle-http/core'
import { MapToTypeKey } from '../Keys'
import { MapToTypeMapperKey } from '../Keys'

const { notNull } = Internals

export function MapTo<M, R = any>(type: new (...args: any[]) => M, mapper?: (response: R) => M | Promise<M>) {
  notNull(type)

  return createMethodDecorator(MapTo, ctx => {
    ctx.requestFactory.addConfig(MapToTypeKey, type)

    if (mapper) {
      ctx.requestFactory.addConfig(MapToTypeMapperKey, mapper)
    }
  })
}
