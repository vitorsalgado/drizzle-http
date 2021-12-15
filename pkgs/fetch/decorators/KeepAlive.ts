import { setupRequestInit } from '../setupRequestInit'

export function KeepAlive(keepAlive: boolean) {
  return function (target: object, method: string): void {
    setupRequestInit(target, method, requestInit => (requestInit.keepalive = keepAlive))
  }
}
