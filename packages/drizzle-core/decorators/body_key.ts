import type { ApiParameterSpec } from './params/api_parameter_spec.js'

export const BodyKey = (name: string): ApiParameterSpec => ({
  apply(ctx) {
    ctx.requestFactory.addConfig(BodyKey.KEY, name)
  }
})

BodyKey.KEY = 'bodykey'
