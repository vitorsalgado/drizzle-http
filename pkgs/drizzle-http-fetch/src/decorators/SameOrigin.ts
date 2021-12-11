import { setupRequestInit } from '../setupRequestInit'

export function SameOrigin() {
  return function (target: object, method: string): void {
    setupRequestInit(target, method, requestInit => (requestInit.mode = 'same-origin'))
  }
}
