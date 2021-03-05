import { provideRequestInit } from '../meta'

export function Cache(cache: RequestCache) {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.cache = cache
  }
}
