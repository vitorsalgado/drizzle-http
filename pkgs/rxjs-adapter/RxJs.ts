import { setupApiMethod } from '@drizzle-http/core'
import { Keys } from './Keys'

export function RxJs() {
  return function (target: object, method: string): void {
    setupApiMethod(target, method, requestFactory => (requestFactory.returnIdentifier = Keys.RxJxKey))
  }
}
