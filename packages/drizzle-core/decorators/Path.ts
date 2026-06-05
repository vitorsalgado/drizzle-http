import { createClassDecorator } from '../api_parameterization.js'

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
  return createClassDecorator(Path, ctx => (ctx.defaults.path = path))
}
