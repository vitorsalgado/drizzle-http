import { createClassAndMethodDecorator } from '../../api_parameterization.js'
import { HttpMethod } from '../../decorators/utils/index.js'

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

const mergeRetryOptions = (options: Partial<RetryOptions>): RetryOptions => ({
  limit: options.limit ?? Def.limit,
  delay: options.delay ?? Def.delay,
  methods: options.methods ?? Def.methods,
  statusCodes: options.statusCodes ?? Def.statusCodes
})

export function Retry(options: Partial<RetryOptions> = Def) {
  return createClassAndMethodDecorator(Retry, ctx => {
    if (ctx.kind === 'method') {
      ctx.requestFactory!.addConfig(RetryOptionsKey, mergeRetryOptions(options))
      return
    }

    ctx.defaults.addConfig(RetryOptionsKey, {
      limit: options.limit ?? Def.limit,
      delay: options.delay ?? Def.delay,
      methods: options.methods ?? Def.methods,
      statusCodes: options.statusCodes ?? Def.statusCodes
    } as RetryOptions)
  })
}
