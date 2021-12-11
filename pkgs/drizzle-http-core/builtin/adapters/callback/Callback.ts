import { setupApiMethod } from '../../../ApiParameterization'
import { KEY_IS_CALLBACK } from './Keys'

export function Callback() {
  return function (target: object, method: string) {
    setupApiMethod(target, method, requestFactory => requestFactory.addConfig(KEY_IS_CALLBACK, true))
  }
}
