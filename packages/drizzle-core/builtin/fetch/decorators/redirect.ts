import { createClassAndMethodDecorator } from '@drizzle-http/core'

export function Redirect(redirect: RequestRedirect) {
  return createClassAndMethodDecorator(Redirect, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.addConfig(Redirect.Key, redirect)
    } else {
      ctx.defaults.addConfig(Redirect.Key, redirect)
    }
  })
}

Redirect.Key = 'fetch:redirect'
