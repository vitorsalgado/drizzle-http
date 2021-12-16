/* eslint-disable @typescript-eslint/no-explicit-any */

import { setupApiMethod } from '@drizzle-http/core'
import { MapFunctionKey } from '../Keys'

export function Map<R = any, TR = any>(mapper: (response: R) => TR) {
  return function (target: object, method: string): void {
    setupApiMethod(target, method, requestFactory => requestFactory.addConfig(MapFunctionKey, mapper))
  }
}
