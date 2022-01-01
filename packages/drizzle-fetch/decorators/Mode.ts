import { createClassAndMethodDecorator } from '@drizzle-http/core'

export function Mode(mode: RequestMode) {
  return createClassAndMethodDecorator(
    Mode,
    defaults => defaults.addConfig(Mode.Key, mode),
    requestFactory => requestFactory.addConfig(Mode.Key, mode)
  )
}

Mode.Key = 'fetch:mode'
