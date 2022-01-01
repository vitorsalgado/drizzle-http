import { createClassAndMethodDecorator } from '@drizzle-http/core'
import { Mode } from './Mode'

export function CORS() {
  return createClassAndMethodDecorator(
    CORS,
    defaults => defaults.addConfig<RequestMode>(Mode.Key, 'cors'),
    requestFactory => requestFactory.addConfig<RequestMode>(Mode.Key, 'cors')
  )
}
