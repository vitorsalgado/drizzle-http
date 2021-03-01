import { DrizzleMeta } from '../drizzle.meta'
import { SignalParameter } from '../request.parameters'

export function Abort(value: string | any | null = null) {
  return function <TFunction extends Function>(
    target: any | TFunction,
    method?: string,
    desc?: number | PropertyDescriptor
  ): void {
    if (method !== null && typeof method !== 'undefined') {
      const requestFactory = DrizzleMeta.provideRequestFactory(target.constructor, method)

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

      return
    }

    if (value === null) {
      throw new TypeError(
        'Abort() value must be null when used as class decorator. ' +
          'Provide an EventEmitter or AbortController.signal. ' +
          `(Class: ${target})`
      )
    }

    const apiInstanceMeta = DrizzleMeta.provideInstanceMetadata(target)
    apiInstanceMeta.signal = value
  }
}

export const Cancellation = Abort
