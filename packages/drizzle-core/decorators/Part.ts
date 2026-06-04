import { PartParameter } from '../builtin/index.js'
import type { ApiParameterSpec } from './params/ApiParameterSpec.js'

export function Part(name: string, filename?: string): ApiParameterSpec {
  return {
    apply(ctx) {
      ctx.requestFactory.addParameter(new PartParameter(ctx.index, name, filename))
    }
  }
}
