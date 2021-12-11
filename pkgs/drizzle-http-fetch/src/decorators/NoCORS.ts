import { setupRequestInit } from '../setupRequestInit'

export function NoCORS() {
  return function (target: object, method: string): void {
    setupRequestInit(target, method, requestInit => (requestInit.mode = 'no-cors'))
  }
}
