import { provideRequestInit } from '../FetchInit'

export function ReferrerPolicy(referrerPolicy: ReferrerPolicy) {
  return function (target: object, method: string): void {
    const requestInit = provideRequestInit(target, method)
    requestInit.referrerPolicy = referrerPolicy
  }
}
