import { createFetchDecorator } from '../setupRequestInit.ts'

export function Cache(cache: RequestCache) {
  return createFetchDecorator(Cache, requestInit => (requestInit.cache = cache))
}
