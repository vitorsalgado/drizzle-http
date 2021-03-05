import { provideRequestInit } from '../meta'

export function Referrer(referrer: string) {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.referrer = referrer
  }
}
