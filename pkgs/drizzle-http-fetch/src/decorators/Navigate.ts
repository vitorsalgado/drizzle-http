import { provideRequestInit } from '../FetchInit'

export function Navigate() {
  return function (target: object, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.mode = 'navigate'
  }
}
