import { DrizzleMeta } from '../../../../DrizzleMeta'
import { KEY_IS_CALLBACK } from './Keys'

export function Callback() {
  return function (target: object, method: string) {
    const requestFactory = DrizzleMeta.provideRequestFactory(target, method)
    requestFactory.addConfig(KEY_IS_CALLBACK, true)
  }
}
