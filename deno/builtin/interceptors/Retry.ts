import { setupRequestFactory } from '../../ApiParameterization.ts'
import { setupApiDefaults } from '../../ApiParameterization.ts'
import { TargetClass } from '../../internal/index.ts'
import { HttpMethod } from '../../decorators/utils/index.ts'

export const RetryOptionsKey = 'retry:options'

export interface RetryOptions {
  limit: number
  methods: HttpMethod[]
  statusCodes: number[]
  delay: number
}

const Def: RetryOptions = {
  limit: 3,
  methods: ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE'],
  statusCodes: [408, 413, 429, 500, 502, 503, 504, 521, 522, 524],
  delay: 500
}

export function Retry(options: Partial<RetryOptions> = Def) {
  return function (target: object | TargetClass, method?: string) {
    if (method) {
      return setupRequestFactory(Retry, target, method, requestFactory =>
        requestFactory.addConfig(RetryOptionsKey, options)
      )
    }

    setupApiDefaults(Retry, target, defaults =>
      defaults.addConfig(RetryOptionsKey, {
        limit: options.limit ?? Def.limit,
        delay: options.delay ?? Def.delay,
        methods: options.methods ?? Def.methods,
        statusCodes: options.statusCodes ?? Def.statusCodes
      } as RetryOptions)
    )
  }
}
