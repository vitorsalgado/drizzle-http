import type { RequestFactory } from '../../request_factory.js'

export interface ApiParameterApplyContext {
  requestFactory: RequestFactory
  index: number
  method: string
}

export interface ApiParameterSpec {
  apply(ctx: ApiParameterApplyContext): void
}
