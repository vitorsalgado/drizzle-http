import { provideRequestInit } from '../FetchInit'

export function Mode(mode: RequestMode) {
  return function (target: object, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.mode = mode
  }
}