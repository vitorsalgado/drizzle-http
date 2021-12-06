import { provideRequestInit } from '../FetchInit'

export function Referrer(referrer: string) {
  return function (target: object, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.referrer = referrer
  }
}
