import { setupRequestInit } from '../setupRequestInit'

export function Mode(mode: RequestMode) {
  return function (target: object, method: string): void {
    setupRequestInit(target, method, requestInit => (requestInit.mode = mode))
  }
}
