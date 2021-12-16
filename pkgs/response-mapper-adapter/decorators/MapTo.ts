/* eslint-disable @typescript-eslint/no-explicit-any */

import { setupApiMethod } from '@drizzle-http/core'
import { Internals } from '@drizzle-http/core'
import { MapToTypeKey } from '../Keys'
import { MapToTypeMapperKey } from '../Keys'

const { notNull } = Internals

export function MapTo<M, R = any>(type: new (...args: any[]) => M, mapper?: (response: R) => M | Promise<M>) {
  notNull(type)

  return function (target: object, method: string): void {
    setupApiMethod(target, method, requestFactory => {
      requestFactory.addConfig(MapToTypeKey, type)

      if (mapper) {
        requestFactory.addConfig(MapToTypeMapperKey, mapper)
      }
    })
  }
}
