import { RequestParameterization } from '../../../request.parameterization'
import { Parameter } from './Parameter'

export abstract class ParameterHandler<P extends Parameter, V> {
  constructor(public readonly parameter: P) {}

  abstract apply(requestValues: RequestParameterization, value: V): void
}
