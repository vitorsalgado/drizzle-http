import { RequestParameterization } from '../../RequestParameterization'

export interface ParameterHandler<V = unknown> {
  handle(requestValues: RequestParameterization, value: V): void
}
