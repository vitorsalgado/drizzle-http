/* eslint-disable @typescript-eslint/no-explicit-any */

import { Internals } from '@drizzle-http/core'
import { createMethodDecorator } from '@drizzle-http/core'
import { MapToTypeKey } from '../keys.js'
import { MapToTypeMapperKey } from '../keys.js'

const { notNull } = Internals

export function MapTo<MODEL_TYPE, FACTORY_METHOD = any>(
  type: new (...args: any[]) => MODEL_TYPE,
  mapper?: (response: FACTORY_METHOD) => MODEL_TYPE | Promise<MODEL_TYPE>
) {
  notNull(type)

  return createMethodDecorator(MapTo, ctx => {
    ctx.requestFactory.addConfig(MapToTypeKey, type)

    if (mapper) {
      ctx.requestFactory.addConfig(MapToTypeMapperKey, mapper)
    }
  })
}
