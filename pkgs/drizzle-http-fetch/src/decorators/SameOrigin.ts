import { provideRequestInit } from '../FetchInit'

export function SameOrigin() {
  return function (target: object, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.mode = 'same-origin'
  }
}
