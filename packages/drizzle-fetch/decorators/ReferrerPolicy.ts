import { createClassAndMethodDecorator } from '@drizzle-http/core'

export function ReferrerPolicy(referrerPolicy: ReferrerPolicy) {
  return createClassAndMethodDecorator(
    ReferrerPolicy,
    defaults => defaults.addConfig(ReferrerPolicy.Key, referrerPolicy),
    requestFactory => requestFactory.addConfig(ReferrerPolicy.Key, referrerPolicy)
  )
}

ReferrerPolicy.Key = 'fetch:referrer_policy'
