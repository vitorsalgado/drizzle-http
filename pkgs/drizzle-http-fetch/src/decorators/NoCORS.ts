import { provideRequestInit } from '../FetchInit'

export function NoCORS() {
  return function (target: object, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.mode = 'no-cors'
  }
}
