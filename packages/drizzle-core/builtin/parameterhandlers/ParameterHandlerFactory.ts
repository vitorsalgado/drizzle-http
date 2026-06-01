import { Drizzle } from '../../Drizzle.js'
import { RequestFactory } from '../../RequestFactory.js'
import { Parameter } from './Parameter.js'
import { ParameterHandler } from './ParameterHandler.js'

export interface ParameterHandlerFactory<P extends Parameter, R> {
  provide(drizzle: Drizzle, requestFactory: RequestFactory, parameter: P): ParameterHandler<R> | null
}
