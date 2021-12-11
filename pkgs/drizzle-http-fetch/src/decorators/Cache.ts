import { setupRequestInit } from '../setupRequestInit'

export function Cache(cache: RequestCache) {
  return function (target: object, method: string): void {
    setupRequestInit(target, method, requestInit => (requestInit.cache = cache))
  }
}
