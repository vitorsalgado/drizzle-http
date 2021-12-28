import { createFetchDecorator } from '../setupRequestInit'

export function Cache(cache: RequestCache) {
  return createFetchDecorator(Cache, requestInit => (requestInit.cache = cache))
}
