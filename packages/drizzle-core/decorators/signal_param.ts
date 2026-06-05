import { SignalParameter } from '../builtin/index.js'
import type { ApiParameterSpec } from './params/api_parameter_spec.js'

export function SignalParam(): ApiParameterSpec {
  return {
    apply(ctx) {
      ctx.requestFactory.addParameter(new SignalParameter(ctx.index))
    }
  }
}
