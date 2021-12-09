import { DrizzleMeta } from '@drizzle-http/core'
import { Keys } from './Keys'

export function RxJs() {
  return function (target: object, method: string): void {
    const requestFactory = DrizzleMeta.provideRequestFactory(target, method)
    requestFactory.returnIdentifier = Keys.RxJxKey
  }
}
