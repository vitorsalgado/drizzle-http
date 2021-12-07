import { provideRequestInit } from '../provideRequestInit'

export function Referrer(referrer: string) {
  return function (target: object, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.referrer = referrer
  }
}
