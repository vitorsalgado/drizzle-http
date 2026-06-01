import { createParameterDecorator } from '../ApiParameterization.js'
import { PartParameter } from '../builtin/index.js'

export function Part(name: string, filename?: string) {
  return createParameterDecorator(Part, ctx =>
    ctx.requestFactory.addParameter(new PartParameter(ctx.parameterIndex, name, filename))
  )
}
