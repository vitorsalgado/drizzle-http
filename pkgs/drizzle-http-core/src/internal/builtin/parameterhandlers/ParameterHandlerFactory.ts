import { Drizzle } from '../../../Drizzle'
import { RequestFactory } from '../../../RequestFactory'
import { Parameter } from './Parameter'
import { ParameterHandler } from './ParameterHandler'

export interface ParameterHandlerFactory<P extends Parameter, R> {
  handledType(): string

  parameterHandler(drizzle: Drizzle, requestFactory: RequestFactory, parameter: P): ParameterHandler<P, R>
}
