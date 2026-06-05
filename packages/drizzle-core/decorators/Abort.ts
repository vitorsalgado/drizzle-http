import { createClassAndMethodDecorator } from '../api_parameterization.js'

export function Abort(value: string | unknown | null = null) {
  return createClassAndMethodDecorator(Abort, ctx => {
    if (ctx.kind === 'method') {
      if (value === null) {
        throw new TypeError(
          'Abort() value must be null when used as method decorator. ' +
            'Provide an EventEmitter or AbortController.signal. ' +
            `(Method: ${ctx.method})`
        )
      }

      ctx.requestFactory!.signal = value
      return
    }

    if (value === null) {
      throw new Error(
        'Abort() value must be null when used as class decorator. ' +
          'Provide an EventEmitter or AbortController.signal. ' +
          `(Class: ${ctx.target})`
      )
    }

    ctx.defaults.signal = value
  })
}
