import { createFetchDecorator } from '../setupRequestInit.ts'

export function ReferrerPolicy(referrerPolicy: ReferrerPolicy) {
  return createFetchDecorator(ReferrerPolicy, requestInit => (requestInit.referrerPolicy = referrerPolicy))
}
