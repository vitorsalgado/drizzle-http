import { createClassAndMethodDecorator } from '@drizzle-http/core'

export function Integrity(integrity: string) {
  return createClassAndMethodDecorator(
    Integrity,
    defaults => defaults.addConfig(Integrity.Key, integrity),
    requestFactory => requestFactory.addConfig(Integrity.Key, integrity)
  )
}

Integrity.Key = 'fetch:integrity'
