import { RequestParameterization } from '../../RequestParameterization'
import { Parameter } from './Parameter'

export interface ParameterHandler<P extends Parameter, V> {
  readonly parameter: P

  apply(requestValues: RequestParameterization, value: V): void
}
