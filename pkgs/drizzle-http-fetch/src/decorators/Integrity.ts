import { setupRequestInit } from '../setupRequestInit'

export function Integrity(integrity: string) {
  return function (target: object, method: string): void {
    setupRequestInit(target, method, requestInit => (requestInit.integrity = integrity))
  }
}
