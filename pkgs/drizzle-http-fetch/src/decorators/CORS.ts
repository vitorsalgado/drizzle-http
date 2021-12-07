import { provideRequestInit } from '../provideRequestInit'

export function CORS() {
  return function (target: object, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.mode = 'cors'
  }
}
