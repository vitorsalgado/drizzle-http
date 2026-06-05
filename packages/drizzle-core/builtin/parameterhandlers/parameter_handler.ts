import { RequestParameterization } from '../../request_parameterization.js'

export interface ParameterHandler<V = unknown> {
  handle(requestValues: RequestParameterization, value: V): void
}
