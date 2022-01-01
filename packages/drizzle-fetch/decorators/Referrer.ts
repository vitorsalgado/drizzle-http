import { createClassAndMethodDecorator } from '@drizzle-http/core'

export function Referrer(referrer: string) {
  return createClassAndMethodDecorator(
    Referrer,
    defaults => defaults.addConfig(Referrer.Key, referrer),
    requestFactory => requestFactory.addConfig(Referrer.Key, referrer)
  )
}

Referrer.Key = 'fetch:referrer'
