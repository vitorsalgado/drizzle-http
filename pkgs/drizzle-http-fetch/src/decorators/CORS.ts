import { provideRequestInit } from '../FetchInit'

export function CORS() {
  return function (target: object, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.mode = 'cors'
  }
}
