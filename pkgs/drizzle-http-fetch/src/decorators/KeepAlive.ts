import { provideRequestInit } from '../FetchInit'

export function KeepAlive(keepAlive: boolean) {
  return function (target: object, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.keepalive = keepAlive
  }
}
