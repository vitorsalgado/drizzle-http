import type { RequestFactory } from '../../RequestFactory.js'

export interface ApiParameterApplyContext {
  requestFactory: RequestFactory
  index: number
  method: string
}

export interface ApiParameterSpec {
  apply(ctx: ApiParameterApplyContext): void
}
