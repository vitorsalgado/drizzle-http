import { provideRequestInit } from '../FetchInit'

export function Cache(cache: RequestCache) {
  return function (target: object, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.cache = cache
  }
}
