import { createParameterDecorator } from '../ApiParameterization.ts'
import { BodyParameter } from '../builtin/index.ts'

/**
 * Use this decorator to mark that a method parameter must be sent as the HTTP Request body
 * Target: parameter
 *
 * @example
 *  \@POST('/relative/path')
 *  example(\@Body() data: object): Promise<Result>
 */
export function Body() {
  return createParameterDecorator(Body, ctx => ctx.requestFactory.addParameter(new BodyParameter(ctx.parameterIndex)))
}
