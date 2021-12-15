import { setupApiMethod } from '../ApiParameterization'
import { setupApiInstance } from '../ApiParameterization'
import { SignalParameter } from '../builtin'

export function Abort(value: string | unknown | null = null) {
  return function <TFunction extends Function>(
    target: object | TFunction,
    method?: string,
    desc?: number | PropertyDescriptor
  ): void {
    if (method !== null && typeof method !== 'undefined') {
      return setupApiMethod(target, method, requestFactory => {
        if (desc !== null && typeof desc === 'number') {
          requestFactory.addParameter(new SignalParameter(desc))
        } else {
          if (value === null) {
            throw new TypeError(
              'Abort() value must be null when used as method decorator. ' +
                'Provide an EventEmitter or AbortController.signal. ' +
                `(Method: ${method})`
            )
          }

          requestFactory.signal = value
        }
      })
    }

    if (value === null) {
      throw new Error(
        'Abort() value must be null when used as class decorator. ' +
          'Provide an EventEmitter or AbortController.signal. ' +
          `(Class: ${target})`
      )
    }

    setupApiInstance(target, globalParameters => (globalParameters.signal = value))
  }
}
