import { createClassAndMethodDecorator } from '@drizzle-http/core'

export function ReferrerPolicy(referrerPolicy: ReferrerPolicy) {
  return createClassAndMethodDecorator(ReferrerPolicy, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.addConfig(ReferrerPolicy.Key, referrerPolicy)
    } else {
      ctx.defaults.addConfig(ReferrerPolicy.Key, referrerPolicy)
    }
  })
}

ReferrerPolicy.Key = 'fetch:referrer_policy'
