import { setupRequestInit } from '../setupRequestInit'

export function Navigate() {
  return function (target: object, method: string): void {
    setupRequestInit(target, method, requestInit => (requestInit.mode = 'navigate'))
  }
}
