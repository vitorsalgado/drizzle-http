import { createParameterDecorator } from '../ApiParameterization.ts'
import { FormParameter } from '../builtin/index.ts'

/**
 * Named form parameter for a form url-encode request.
 * If you don't provide the field key, the parameter name will be used.
 * The request must be decorated with \@FormUrlEncoded
 * Target: parameter
 *
 * @param key - named pair for a form url-encode request
 *
 * @example
 *  \@POST('/relative/path')
 *  \@FormUrlEncoded
 *  example(\@Field('name') name: string, \@Field('id') id: string): Promise<Result>
 */
export function Field(key: string) {
  return createParameterDecorator(Field, ctx =>
    ctx.requestFactory.addParameter(new FormParameter(key, ctx.parameterIndex))
  )
}
