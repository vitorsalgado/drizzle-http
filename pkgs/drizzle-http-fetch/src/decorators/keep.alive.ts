import { provideRequestInit } from '../meta'

export function KeepAlive(keepAlive: boolean) {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.keepalive = keepAlive
  }
}
