import { SignalParameter } from '../builtin/index.js'
import type { ApiParameterSpec } from './params/ApiParameterSpec.js'

export function SignalParam(): ApiParameterSpec {
  return {
    apply(ctx) {
      ctx.requestFactory.addParameter(new SignalParameter(ctx.index))
    }
  }
}
