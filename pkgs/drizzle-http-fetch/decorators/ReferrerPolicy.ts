import { setupRequestInit } from '../setupRequestInit'

export function ReferrerPolicy(referrerPolicy: ReferrerPolicy) {
  return function (target: object, method: string): void {
    setupRequestInit(target, method, requestInit => (requestInit.referrerPolicy = referrerPolicy))
  }
}
