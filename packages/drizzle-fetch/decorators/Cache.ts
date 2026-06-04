import { createClassAndMethodDecorator } from '@drizzle-http/core'

export function Cache(cache: RequestCache) {
  return createClassAndMethodDecorator(Cache, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.addConfig(Cache.Key, cache)
    } else {
      ctx.defaults.addConfig(Cache.Key, cache)
    }
  })
}

Cache.Key = 'fetch:cache'
