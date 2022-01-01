import { createClassAndMethodDecorator } from '@drizzle-http/core'

export function Redirect(redirect: RequestRedirect) {
  return createClassAndMethodDecorator(
    Redirect,
    defaults => defaults.addConfig(Redirect.Key, redirect),
    requestFactory => requestFactory.addConfig(Redirect.Key, redirect)
  )
}

Redirect.Key = 'fetch:redirect'
