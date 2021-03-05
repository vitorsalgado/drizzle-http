import { provideRequestInit } from '../meta'

export function ReferrerPolicy(referrerPolicy: ReferrerPolicy) {
  return function (target: any, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.referrerPolicy = referrerPolicy
  }
}
