import { createClassAndMethodDecorator } from '@drizzle-http/core'

export function Credentials(credentials: RequestCredentials) {
  return createClassAndMethodDecorator(Credentials, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.addConfig(Credentials.Key, credentials)
    } else {
      ctx.defaults.addConfig(Credentials.Key, credentials)
    }
  })
}

Credentials.Key = 'fetch:credentials'
