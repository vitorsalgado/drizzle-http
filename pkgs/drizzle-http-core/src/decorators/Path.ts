import { DrizzleMeta } from '../drizzle.meta'

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
  return function <TFunction extends Function>(target: TFunction) {
    const apiInstanceMeta = DrizzleMeta.provideInstanceMetadata(target)
    apiInstanceMeta.setPath(path)
  }
}
