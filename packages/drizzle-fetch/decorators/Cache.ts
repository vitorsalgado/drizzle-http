import { createClassAndMethodDecorator } from '@drizzle-http/core'

export function Cache(cache: RequestCache) {
  return createClassAndMethodDecorator(
    Cache,
    defaults => defaults.addConfig(Cache.Key, cache),
    requestFactory => requestFactory.addConfig(Cache.Key, cache)
  )
}

Cache.Key = 'fetch:cache'
