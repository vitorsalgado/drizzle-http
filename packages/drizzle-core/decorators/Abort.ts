import { setupApiDefaults, setupRequestFactory } from '../ApiParameterization'
import { SignalParameter } from '../builtin'
import { TargetCtor, TargetProto } from '../internal'

export function Abort(value: string | unknown | null = null) {
  return function (target: TargetProto | TargetCtor, method?: string, desc?: number | PropertyDescriptor): void {
    if (method !== null && typeof method !== 'undefined') {
      return setupRequestFactory(Abort, target, method, requestFactory => {
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

    setupApiDefaults(Abort, target, globalParameters => (globalParameters.signal = value))
  }
}
