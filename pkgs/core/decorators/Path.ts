import { createClassDecorator } from '../ApiParameterization'
import { Param } from './Param'

/**
 * Sets an url path that will be concatenated with the base url and the final processed path
 * Target: class
 *
 * @param path - relative url path
 *
 * @example
 *
 *  \@Path('/some/path')
 *  class API \{ \}
 */
export function Path(path: string) {
  return createClassDecorator(Param, ctx => (ctx.defaults.path = path))
}
