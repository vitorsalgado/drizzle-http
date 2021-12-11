import { setupRequestInit } from '../setupRequestInit'

export function Referrer(referrer: string) {
  return function (target: object, method: string): void {
    setupRequestInit(target, method, requestInit => (requestInit.referrer = referrer))
  }
}
