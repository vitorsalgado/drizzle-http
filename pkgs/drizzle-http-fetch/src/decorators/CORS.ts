import { setupRequestInit } from '../setupRequestInit'

export function CORS() {
  return function (target: object, method: string): void {
    setupRequestInit(target, method, requestInit => (requestInit.mode = 'cors'))
  }
}
