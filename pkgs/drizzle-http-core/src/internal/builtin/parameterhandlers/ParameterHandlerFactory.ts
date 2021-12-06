import { Drizzle } from '../../../Drizzle'
import { RequestFactory } from '../../../RequestFactory'
import { Parameter } from './Parameter'
import { ParameterHandler } from './ParameterHandler'

export abstract class ParameterHandlerFactory<P extends Parameter, R> {
  abstract handledType(): string

  abstract parameterHandler(drizzle: Drizzle, requestFactory: RequestFactory, parameter: P): ParameterHandler<P, R>
}
