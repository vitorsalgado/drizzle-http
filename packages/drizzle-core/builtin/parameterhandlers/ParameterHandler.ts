import { RequestParameterization } from '../../RequestParameterization.js'

export interface ParameterHandler<V = unknown> {
  handle(requestValues: RequestParameterization, value: V): void
}
