import { createClassAndMethodDecorator } from '@drizzle-http/core'

export function KeepAlive(keepalive: boolean) {
  return createClassAndMethodDecorator(
    KeepAlive,
    defaults => defaults.addConfig(KeepAlive.Key, keepalive),
    requestFactory => requestFactory.addConfig(KeepAlive.Key, keepalive)
  )
}

KeepAlive.Key = 'fetch:keepalive'
