import { KEY_IS_CALLBACK } from './Keys'
import DrizzleMeta from '../../../../drizzle.meta'

export function Callback() {
  return function (target: object, method: string) {
    const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor.name, method)
    requestFactory.addConfig(KEY_IS_CALLBACK, true)
  }
}
