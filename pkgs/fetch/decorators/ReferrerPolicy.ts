import { createFetchDecorator } from '../setupRequestInit'

export function ReferrerPolicy(referrerPolicy: ReferrerPolicy) {
  return createFetchDecorator(ReferrerPolicy, requestInit => (requestInit.referrerPolicy = referrerPolicy))
}
