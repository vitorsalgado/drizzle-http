import { createParameterDecorator } from '../ApiParameterization'
import { PartParameter } from '../builtin'

export function Part(name: string, filename?: string) {
  return createParameterDecorator(Part, ctx =>
    ctx.requestFactory.addParameter(new PartParameter(ctx.parameterIndex, name, filename))
  )
}
